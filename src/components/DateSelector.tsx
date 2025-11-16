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
const DateSelector = ({
  data,
  selectedDate,
  onDateChange
}: DateSelectorProps) => {
  const yearOptions = useMemo(() => {
    if (!data.length) return [];
    const years = new Set(data.map(d => new Date(d.date).getFullYear()));
    return Array.from(years).sort((a, b) => a - b);
  }, [data]);
  const dateOptions = useMemo(() => {
    if (!data.length) return [];
    return data.map(d => d.date);
  }, [data]);
  if (!data.length) return null;
  return;
};
export default DateSelector;