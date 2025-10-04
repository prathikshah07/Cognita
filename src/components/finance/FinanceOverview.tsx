import { DashboardCard } from '../dashboard/DashboardCard';
import { DollarSign } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useMemo } from 'react';

export const FinanceOverview = () => {
  const { data: transactions = [], isLoading } = useTransactions();

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, balance };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <DashboardCard
        title="Finance"
        icon={DollarSign}
        value="Loading..."
        subtitle="Current Balance"
        gradient="bg-gradient-success"
      />
    );
  }

  return (
    <DashboardCard
      title="Finance"
      icon={DollarSign}
      value={formatCurrency(stats.balance)}
      subtitle="Current Balance"
      trend={{
        value: `${stats.balance >= 0 ? '+' : ''}${formatCurrency(stats.balance)}`,
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