import { DashboardCard } from '../dashboard/DashboardCard';
import { DollarSign } from 'lucide-react';
import { mockTransactions } from '@/data/mockData';
import { useMemo } from 'react';

export const FinanceOverview = () => {
  const stats = useMemo(() => {
    const totalIncome = mockTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = mockTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    return { totalIncome, totalExpenses, balance };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <DashboardCard
      title="Finance"
      icon={DollarSign}
      value={formatCurrency(stats.balance)}
      subtitle="Current Balance"
      trend={{
        value: `+${formatCurrency(stats.totalIncome - stats.totalExpenses)}`,
        isPositive: stats.balance > 0
      }}
      gradient="bg-gradient-success"
    >
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-white/70">Income</div>
          <div className="font-semibold text-white">{formatCurrency(stats.totalIncome)}</div>
        </div>
        <div>
          <div className="text-white/70">Expenses</div>
          <div className="font-semibold text-white">{formatCurrency(stats.totalExpenses)}</div>
        </div>
      </div>
    </DashboardCard>
  );
};