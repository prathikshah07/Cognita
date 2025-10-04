import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SleepGoal } from '@/types';
import { Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SleepGoalsProps {
  goal: SleepGoal;
  onUpdate: (goal: SleepGoal) => void;
  averageSleep: number;
}

export const SleepGoals = ({ goal, onUpdate, averageSleep }: SleepGoalsProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    targetHours: goal.targetHours.toString(),
    targetBedtime: goal.targetBedtime
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      targetHours: parseFloat(formData.targetHours),
      targetBedtime: formData.targetBedtime
    });
    toast({
      title: "Sleep Goal Updated",
      description: "Your sleep targets have been updated.",
    });
  };

  const isOnTrack = averageSleep >= goal.targetHours - 0.5 && averageSleep <= goal.targetHours + 0.5;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Target className="h-5 w-5" />
        Sleep Goals
      </h3>
      
      <div className={`p-4 rounded-lg mb-4 ${isOnTrack ? 'bg-success/10' : 'bg-warning/10'}`}>
        <div className="text-sm text-muted-foreground">Current Average</div>
        <div className="text-2xl font-bold">{averageSleep}h</div>
        <div className="text-sm mt-1">
          {isOnTrack ? '✓ On track with your goal!' : '⚠ Consider adjusting your sleep schedule'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="target-hours">Target Hours</Label>
          <Input
            id="target-hours"
            type="number"
            step="0.5"
            value={formData.targetHours}
            onChange={(e) => setFormData(prev => ({ ...prev, targetHours: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="target-bedtime">Target Bedtime</Label>
          <Input
            id="target-bedtime"
            type="time"
            value={formData.targetBedtime}
            onChange={(e) => setFormData(prev => ({ ...prev, targetBedtime: e.target.value }))}
          />
        </div>
        <Button type="submit" className="w-full">Update Goals</Button>
      </form>
    </Card>
  );
};
