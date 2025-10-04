import { useState, useMemo } from 'react';
import { TransactionForm } from '@/components/finance/TransactionForm';
import { TransactionList } from '@/components/finance/TransactionList';
import { FinanceChart } from '@/components/finance/FinanceChart';
import { BudgetManager } from '@/components/finance/BudgetManager';
import { ExportData } from '@/components/shared/ExportData';
import { DateRangeFilter } from '@/components/shared/DateRangeFilter';
import { SearchBar } from '@/components/shared/SearchBar';
import { Card } from '@/components/ui/card';
import { useTransactions, useAddTransaction, useDeleteTransaction } from '@/hooks/useTransactions';
import { useBudgets, useAddBudget, useDeleteBudget } from '@/hooks/useBudgets';
import { toast } from 'sonner';

const Finance = () => {
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  const addTransaction = useAddTransaction();
  const deleteTransaction = useDeleteTransaction();
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
  const addBudget = useAddBudget();
  const deleteBudget = useDeleteBudget();
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleAddTransaction = async (newTransaction: { amount: number; category: string; description: string; date: string; type: 'income' | 'expense' }) => {
    try {
      await addTransaction.mutateAsync(newTransaction);
      toast.success('Transaction added successfully');
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction.mutateAsync(id);
      toast.success('Transaction deleted');
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleAddBudget = async (newBudget: { category: string; amount: number; period: 'weekly' | 'monthly' }) => {
    try {
      await addBudget.mutateAsync(newBudget);
      toast.success('Budget added successfully');
    } catch (error) {
      toast.error('Failed to add budget');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await deleteBudget.mutateAsync(id);
      toast.success('Budget deleted');
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const transactionDate = new Date(t.date);
      const matchesDateRange = (!startDate || transactionDate >= new Date(startDate)) &&
        (!endDate || transactionDate <= new Date(endDate));
      return matchesSearch && matchesDateRange;
    });
  }, [transactions, searchQuery, startDate, endDate]);

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Finance Tracker</h1>
            <p className="text-muted-foreground">Manage your income and expenses</p>
          </div>
          <ExportData data={filteredTransactions} filename="transactions" label="Export" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-lg bg-gradient-success text-white">
            <div className="text-sm opacity-90">Total Income</div>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
          </div>
          <div className="p-6 rounded-lg bg-gradient-warning text-white">
            <div className="text-sm opacity-90">Total Expenses</div>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          </div>
          <div className={`p-6 rounded-lg text-white ${balance >= 0 ? 'bg-gradient-primary' : 'bg-gradient-primary opacity-60'}`}>
            <div className="text-sm opacity-90">Balance</div>
            <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          </div>
        </div>

        {/* Budget Manager */}
        <div className="mb-8">
          <BudgetManager
            budgets={budgets}
            onAdd={handleAddBudget}
            onDelete={handleDeleteBudget}
          />
        </div>

        {/* Charts */}
        <div className="mb-8">
          <FinanceChart transactions={filteredTransactions} />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by category or note..."
            />
          </Card>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>

        {/* Form and List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TransactionForm onAdd={handleAddTransaction} />
          <TransactionList 
            transactions={filteredTransactions}
            onDelete={handleDeleteTransaction}
          />
        </div>
      </main>
    </div>
  );
};

export default Finance;
