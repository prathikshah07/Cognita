import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const DateRangeFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}: DateRangeFilterProps) => {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Filter by Date Range</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-date" className="text-xs">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="text-sm"
          />
        </div>
        <div>
          <Label htmlFor="end-date" className="text-xs">End Date</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>
    </Card>
  );
};
