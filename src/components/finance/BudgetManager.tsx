import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Budget } from '@/types';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BudgetManagerProps {
  budgets: Budget[];
  onAdd: (budget: Omit<Budget, 'id'>) => void;
  onDelete: (id: string) => void;
}

export const BudgetManager = ({ budgets, onAdd, onDelete }: BudgetManagerProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly' as 'monthly' | 'weekly'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.limit) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    onAdd({
      category: formData.category,
      limit: parseFloat(formData.limit),
      period: formData.period
    });

    setFormData({ category: '', limit: '', period: 'monthly' });
    toast({ title: "Budget Added", description: `Budget for ${formData.category} set.` });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Budget Management</h3>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="budget-category">Category</Label>
            <Input
              id="budget-category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Groceries"
            />
          </div>
          <div>
            <Label htmlFor="budget-limit">Limit</Label>
            <Input
              id="budget-limit"
              type="number"
              step="0.01"
              value={formData.limit}
              onChange={(e) => setFormData(prev => ({ ...prev, limit: e.target.value }))}
              placeholder="500"
            />
          </div>
          <div>
            <Label htmlFor="budget-period">Period</Label>
            <Select value={formData.period} onValueChange={(value: 'monthly' | 'weekly') =>
              setFormData(prev => ({ ...prev, period: value }))
            }>
              <SelectTrigger id="budget-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </form>

      <div className="space-y-2">
        {budgets.map((budget) => (
          <div key={budget.id} className="flex justify-between items-center p-3 rounded-lg border border-border">
            <div>
              <div className="font-medium">{budget.category}</div>
              <div className="text-sm text-muted-foreground">{budget.period}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-success">${budget.limit}</span>
              <Button variant="ghost" size="sm" onClick={() => onDelete(budget.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
