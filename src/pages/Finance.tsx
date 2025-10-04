import { useState, useEffect, useMemo } from "react";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { TransactionList } from "@/components/finance/TransactionList";
import { FinanceChart } from "@/components/finance/FinanceChart";
import { BudgetManager } from "@/components/finance/BudgetManager";
import { ExportData } from "@/components/shared/ExportData";
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import { SearchBar } from "@/components/shared/SearchBar";
import { Card } from "@/components/ui/card";
import { Transaction, Budget } from "@/types";
import { supabase } from "@/lib/supabaseClient";

const Finance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch transactions & budgets
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Transactions
        const { data: transactionsData, error: txError } = await supabase
          .from("transactions")
          .select("id, amount, category, type, date, note")
          .order("date", { ascending: false });
        if (txError) throw txError;
        setTransactions(transactionsData || []);

        // Budgets
        const { data: budgetsData, error: budgetError } = await supabase
          .from("budgets")
          .select("id, category, period, limit_amount");
        if (budgetError) throw budgetError;
        // Map the data to the correct Budget type
        const formattedBudgets = budgetsData ? budgetsData.map(b => ({
          id: b.id,
          category: b.category,
          period: b.period,
          limit: b.limit_amount,
        })) : [];
        setBudgets(formattedBudgets);
      } catch (err: any) {
        console.error("Error fetching data:", err.message);
        setErrorMsg("Failed to load data from database.");
      }
    };

    fetchData();
  }, []);

  // Add Transaction
  const handleAddTransaction = async (
    newTransaction: Omit<Transaction, "id">
  ) => {
    const payload = {
      amount: newTransaction.amount,
      category: newTransaction.category,
      type: newTransaction.type,
      date: newTransaction.date,
      note: newTransaction.note || null,
    };

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([payload])
        .select("id, amount, category, type, date, note")
        .single();
      if (error) throw error;
      setTransactions((prev) => [data, ...prev]);
    } catch (err: any) {
      console.error("Error adding transaction:", err.message);
      setErrorMsg("Failed to add transaction.");
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) {
      console.error("Error deleting transaction:", error.message);
      return;
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Add Budget
  const handleAddBudget = async (newBudget: Omit<Budget, "id">) => {
    const payload = {
      category: newBudget.category,
      period: newBudget.period,
      limit_amount: newBudget.limit, // ✅ Required column
    };

    try {
      const { data, error } = await supabase
        .from("budgets")
        .insert([payload])
        .select("id, category, period, limit_amount")
        .single();
      if (error) throw error;
      // Map the data to the correct Budget type
      const formattedBudget = {
        id: data.id,
        category: data.category,
        period: data.period,
        limit: data.limit_amount,
      };
      setBudgets((prev) => [...prev, formattedBudget]);
    } catch (err: any) {
      console.error("Error adding budget:", err.message);
      setErrorMsg("Failed to add budget.");
    }
  };

  // Delete Budget
  const handleDeleteBudget = async (id: string) => {
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (error) {
      console.error("Error deleting budget:", error.message);
      return;
    }
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.note?.toLowerCase().includes(searchQuery.toLowerCase());

      const transactionDate = new Date(t.date);
      const matchesDateRange =
        (!startDate || transactionDate >= new Date(startDate)) &&
        (!endDate || transactionDate <= new Date(endDate));

      return matchesSearch && matchesDateRange;
    });
  }, [transactions, searchQuery, startDate, endDate]);

  // Summary
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Finance Tracker
            </h1>
            <p className="text-muted-foreground">
              Manage your income and expenses
            </p>
          </div>
          <ExportData
            data={filteredTransactions}
            filename="transactions"
            label="Export"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-lg bg-gradient-success text-white">
            <div className="text-sm opacity-90">Total Income</div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalIncome)}
            </div>
          </div>
          <div className="p-6 rounded-lg bg-gradient-warning text-white">
            <div className="text-sm opacity-90">Total Expenses</div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpenses)}
            </div>
          </div>
          <div
            className={`p-6 rounded-lg text-white ${
              balance >= 0
                ? "bg-gradient-primary"
                : "bg-gradient-primary opacity-60"
            }`}
          >
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

        {/* Finance Chart */}
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

        {/* Error Message */}
        {errorMsg && <p className="text-red-500 mt-4">{errorMsg}</p>}
      </main>
    </div>
  );
};

export default Finance;
