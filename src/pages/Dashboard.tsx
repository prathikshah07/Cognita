import { FinanceOverview } from '@/components/finance/FinanceOverview';
import { StudyOverview } from '@/components/study/StudyOverview';
import { SleepOverview } from '@/components/sleep/SleepOverview';
import { Button } from '@/components/ui/button';
import { DollarSign, BookOpen, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your daily progress across finance, study, and sleep.</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <FinanceOverview />
          <StudyOverview />
          <SleepOverview />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => navigate('/finance')}
            variant="outline"
            className="h-20 flex flex-col gap-2 border-success/20 hover:bg-success/5"
          >
            <DollarSign className="h-6 w-6 text-success" />
            <span>Manage Finance</span>
          </Button>
          
          <Button 
            onClick={() => navigate('/study')}
            variant="outline"
            className="h-20 flex flex-col gap-2 border-primary/20 hover:bg-primary/5"
          >
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Log Study Session</span>
          </Button>
          
          <Button 
            onClick={() => navigate('/sleep')}
            variant="outline"
            className="h-20 flex flex-col gap-2 border-warning/20 hover:bg-warning/5"
          >
            <Moon className="h-6 w-6 text-warning" />
            <span>Track Sleep</span>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;