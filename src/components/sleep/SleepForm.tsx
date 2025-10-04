import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SleepRecord } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface SleepFormProps {
  onAdd: (record: Omit<SleepRecord, 'id'>) => void;
}

export const SleepForm = ({ onAdd }: SleepFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    bedtime: '',
    wakeTime: '',
    date: new Date().toISOString().split('T')[0],
    quality: 'good' as 'poor' | 'fair' | 'good' | 'excellent',
    notes: ''
  });

  const calculateDuration = (bedtime: string, wakeTime: string) => {
    if (!bedtime || !wakeTime) return 0;
    
    const bedtimeDate = new Date(`2000-01-01T${bedtime}:00`);
    let wakeTimeDate = new Date(`2000-01-01T${wakeTime}:00`);
    
    // If wake time is earlier than bedtime, assume it's the next day
    if (wakeTimeDate <= bedtimeDate) {
      wakeTimeDate = new Date(`2000-01-02T${wakeTime}:00`);
    }
    
    const diffMs = wakeTimeDate.getTime() - bedtimeDate.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10; // Round to 1 decimal place
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bedtime || !formData.wakeTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in bedtime and wake time.",
        variant: "destructive"
      });
      return;
    }

    const duration = calculateDuration(formData.bedtime, formData.wakeTime);

    onAdd({
      bedtime: formData.bedtime,
      wakeTime: formData.wakeTime,
      date: formData.date,
      duration,
      quality: formData.quality,
      notes: formData.notes
    });

    setFormData({
      bedtime: '',
      wakeTime: '',
      date: new Date().toISOString().split('T')[0],
      quality: 'good',
      notes: ''
    });

    toast({
      title: "Sleep Record Added",
      description: `${duration} hours of sleep recorded.`,
    });
  };

  const previewDuration = calculateDuration(formData.bedtime, formData.wakeTime);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Log Sleep</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bedtime">Bedtime</Label>
            <Input
              id="bedtime"
              type="time"
              value={formData.bedtime}
              onChange={(e) => setFormData(prev => ({ ...prev, bedtime: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="wakeTime">Wake Time</Label>
            <Input
              id="wakeTime"
              type="time"
              value={formData.wakeTime}
              onChange={(e) => setFormData(prev => ({ ...prev, wakeTime: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="quality">Sleep Quality</Label>
          <Select value={formData.quality} onValueChange={(value: 'poor' | 'fair' | 'good' | 'excellent') =>
            setFormData(prev => ({ ...prev, quality: value }))
          }>
            <SelectTrigger id="quality">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="poor">Poor</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sleep-notes">Notes (Optional)</Label>
          <Textarea
            id="sleep-notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any dreams or observations?"
            rows={2}
          />
        </div>

        {previewDuration > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Sleep Duration</div>
            <div className="text-lg font-semibold text-primary">{previewDuration} hours</div>
          </div>
        )}

        <Button type="submit" className="w-full bg-gradient-warning border-0 hover:opacity-90">
          Log Sleep
        </Button>
      </form>
    </Card>
  );
};