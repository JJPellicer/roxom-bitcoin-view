import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AssetData } from "@/pages/Simulator";

interface DateSelectorProps {
  data: AssetData[];
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
}

const DateSelector = ({ data, selectedDate, onDateChange }: DateSelectorProps) => {
  const yearOptions = useMemo(() => {
    if (!data.length) return [];
    const years = new Set(data.map((d) => new Date(d.date).getFullYear()));
    return Array.from(years).sort((a, b) => a - b);
  }, [data]);

  const dateOptions = useMemo(() => {
    if (!data.length) return [];
    return data.map((d) => d.date);
  }, [data]);

  if (!data.length) return null;

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-foreground">Time Period Selection</h3>
          <p className="text-xs text-muted-foreground">
            Choose a date to split the chart into past (solid) and future (faded)
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
          <Select value={selectedDate || ""} onValueChange={(value) => onDateChange(value || null)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a date" />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map((date) => (
                <SelectItem key={date} value={date}>
                  {date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedDate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(null)}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DateSelector;
