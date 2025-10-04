import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StudyGoal } from '@/types';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface StudyGoalsProps {
  goals: StudyGoal[];
  currentHours: Record<string, number>;
  onAdd: (goal: Omit<StudyGoal, 'id'>) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export const StudyGoals = ({ goals, currentHours, onAdd, onDelete, onToggleComplete }: StudyGoalsProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    targetHours: '',
    deadline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.targetHours || !formData.deadline) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    onAdd({
      subject: formData.subject,
      targetHours: parseFloat(formData.targetHours),
      deadline: formData.deadline,
      completed: false
    });

    setFormData({ subject: '', targetHours: '', deadline: '' });
    toast({ title: "Goal Added", description: `Goal for ${formData.subject} created.` });
  };

  const getProgress = (goal: StudyGoal) => {
    const current = (currentHours[goal.subject] || 0) / 60;
    return Math.min((current / goal.targetHours) * 100, 100);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Study Goals</h3>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="goal-subject">Subject</Label>
            <Input
              id="goal-subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="React"
            />
          </div>
          <div>
            <Label htmlFor="goal-hours">Target Hours</Label>
            <Input
              id="goal-hours"
              type="number"
              step="0.5"
              value={formData.targetHours}
              onChange={(e) => setFormData(prev => ({ ...prev, targetHours: e.target.value }))}
              placeholder="20"
            />
          </div>
          <div>
            <Label htmlFor="goal-deadline">Deadline</Label>
            <Input
              id="goal-deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
            />
          </div>
        </div>
        <Button type="submit" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </form>

      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className={`p-4 rounded-lg border ${goal.completed ? 'bg-success/5 border-success/20' : 'border-border'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium flex items-center gap-2">
                  {goal.subject}
                  {goal.completed && <CheckCircle className="h-4 w-4 text-success" />}
                </div>
                <div className="text-sm text-muted-foreground">
                  {goal.targetHours}h by {new Date(goal.deadline).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onToggleComplete(goal.id)}>
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(goal.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Progress value={getProgress(goal)} className="h-2" />
              <div className="text-xs text-muted-foreground text-right">
                {Math.round((currentHours[goal.subject] || 0) / 60 * 10) / 10}h / {goal.targetHours}h
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
