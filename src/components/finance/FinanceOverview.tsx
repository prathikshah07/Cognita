import { DashboardCard } from "../dashboard/DashboardCard";
import { DollarSign } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
  note?: string;
}

export const FinanceOverview = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch transactions from Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (error) console.error("Error fetching transactions:", error.message);
      else setTransactions(data || []);
    };

    fetchTransactions();
  }, []);

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, balance };
  }, [transactions]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  return (
    <DashboardCard
      title="Finance"
      icon={DollarSign}
      value={formatCurrency(stats.balance)}
      subtitle="Current Balance"
      trend={{
        value: `${stats.balance >= 0 ? "+" : "-"}${formatCurrency(
          Math.abs(stats.totalIncome - stats.totalExpenses)
        )}`,
        isPositive: stats.balance >= 0,
      }}
      gradient="bg-gradient-success"
    >
      <div className="grid grid-cols-2 gap-4 text-sm mt-2">
        <div>
          <div className="text-white/70">Income</div>
          <div className="font-semibold text-white">
            {formatCurrency(stats.totalIncome)}
          </div>
        </div>
        <div>
          <div className="text-white/70">Expenses</div>
          <div className="font-semibold text-white">
            {formatCurrency(stats.totalExpenses)}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};
