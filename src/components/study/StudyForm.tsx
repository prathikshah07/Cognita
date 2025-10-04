import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StudySession } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface StudyFormProps {
  onAdd: (session: Omit<StudySession, 'id'>) => void;
}

export const StudyForm = ({ onAdd }: StudyFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    duration: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in subject and duration.",
        variant: "destructive"
      });
      return;
    }

    onAdd({
      subject: formData.subject,
      duration: parseInt(formData.duration),
      date: formData.date,
      notes: formData.notes,
      priority: formData.priority
    });

    setFormData({
      subject: '',
      duration: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      priority: 'medium'
    });

    toast({
      title: "Study Session Added",
      description: `${formData.duration} minutes of ${formData.subject} recorded.`,
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Log Study Session</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="e.g., React Development, Machine Learning"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="60"
              min="1"
            />
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
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') =>
              setFormData(prev => ({ ...prev, priority: value }))
            }>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="What did you study?"
            rows={2}
          />
        </div>

        <Button type="submit" className="w-full bg-gradient-primary border-0 hover:opacity-90">
          Log Session
        </Button>
      </form>
    </Card>
  );
};