import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Transaction } from '@/types';
import { useMemo } from 'react';

interface FinanceChartProps {
  transactions: Transaction[];
}

export const FinanceChart = ({ transactions }: FinanceChartProps) => {
  // Aggregate monthly income and expense
  const chartData = useMemo(() => {
    const monthlyData = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
      t.type === 'income' ? (acc[month].income += t.amount) : (acc[month].expense += t.amount);
      return acc;
    }, {} as Record<string, { month: string; income: number; expense: number }>);
    return Object.values(monthlyData);
  }, [transactions]);

  // Aggregate by category for PieChart
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.forEach((t) => {
      if (!categories[t.category]) categories[t.category] = 0;
      categories[t.category] += t.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income vs Expenses BarChart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="income" fill="#22c55e" name="Income" />
            <Bar dataKey="expense" fill="#ef4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Spending by Category PieChart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Spending by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
