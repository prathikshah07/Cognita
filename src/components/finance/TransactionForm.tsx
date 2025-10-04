import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}

export const TransactionForm = ({ onAdd }: TransactionFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    note: '',
    recurring: false,
    recurringFrequency: 'monthly' as 'daily' | 'weekly' | 'monthly'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in amount and category.",
        variant: "destructive"
      });
      return;
    }

    onAdd({
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      date: formData.date,
      note: formData.note,
      recurring: formData.recurring,
      recurringFrequency: formData.recurringFrequency
    });

    setFormData({
      amount: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      note: '',
      recurring: false,
      recurringFrequency: 'monthly'
    });

    toast({
      title: "Transaction Added",
      description: `${formData.type === 'income' ? 'Income' : 'Expense'} of $${formData.amount} recorded.`,
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Add Transaction</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => 
              setFormData(prev => ({ ...prev, type: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="e.g., Groceries, Salary"
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
        </div>

        <div>
          <Label htmlFor="note">Note (Optional)</Label>
          <Textarea
            id="note"
            value={formData.note}
            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
            placeholder="Add a note..."
            rows={2}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="recurring"
            checked={formData.recurring}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, recurring: !!checked }))}
          />
          <Label htmlFor="recurring" className="cursor-pointer">Recurring Transaction</Label>
        </div>

        {formData.recurring && (
          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={formData.recurringFrequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
              setFormData(prev => ({ ...prev, recurringFrequency: value }))
            }>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button type="submit" className="w-full bg-gradient-success border-0 hover:opacity-90">
          Add Transaction
        </Button>
      </form>
    </Card>
  );
};