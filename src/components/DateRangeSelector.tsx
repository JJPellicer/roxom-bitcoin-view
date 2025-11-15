import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

const DateRangeSelector = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
}: DateRangeSelectorProps) => {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">Time Period</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="start-date" className="text-sm text-muted-foreground">
            From:
          </Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            min={minDate}
            max={endDate || maxDate}
            className="w-[160px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="end-date" className="text-sm text-muted-foreground">
            To:
          </Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate || minDate}
            max={maxDate}
            className="w-[160px]"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (minDate && maxDate) {
              onStartDateChange(minDate);
              onEndDateChange(maxDate);
            }
          }}
        >
          Reset
        </Button>
      </div>
    </Card>
  );
};

export default DateRangeSelector;
