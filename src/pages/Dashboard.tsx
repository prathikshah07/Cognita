// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { FinanceOverview } from "@/components/finance/FinanceOverview";
import { StudyOverview } from "@/components/study/StudyOverview";
import { SleepOverview } from "@/components/sleep/SleepOverview";
import { Button } from "@/components/ui/button";
import { DollarSign, BookOpen, Moon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUsername(user.user_metadata?.full_name || user.email || "User");
      }
    };
    fetchUser();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error.message);
    else navigate("/"); // redirect to onboarding/login
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Hello,{" "}
              <span className="transition-colors text-primary">{username}</span>
              !
            </h1>
            <p className="text-muted-foreground">
              Track your daily progress across finance, study, and sleep.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Logout button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <FinanceOverview />
          <StudyOverview />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => navigate("/finance")}
            variant="outline"
            className="h-20 flex flex-col gap-2 border-success/2 hover:bg-success/5"
          >
            <DollarSign className="h-6 w-6 text-success" />
            <span>Manage Finance</span>
          </Button>

          <Button
            onClick={() => navigate("/study")}
            variant="outline"
            className="h-20 flex flex-col gap-2 border-primary/2 hover:bg-primary/5"
          >
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Log Study Session</span>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
