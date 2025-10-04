import { DashboardCard } from '../dashboard/DashboardCard';
import { BookOpen } from 'lucide-react';
import { mockStudySessions } from '@/data/mockData';
import { useMemo } from 'react';

export const StudyOverview = () => {
  const stats = useMemo(() => {
    const totalMinutes = mockStudySessions.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
    
    const subjectCounts = mockStudySessions.reduce((acc, session) => {
      acc[session.subject] = (acc[session.subject] || 0) + session.duration;
      return acc;
    }, {} as Record<string, number>);
    
    const topSubject = Object.entries(subjectCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
    
    // Last 7 days
    const weeklyHours = Math.round(totalMinutes / 60 * 10) / 10; // Mock data - in real app would filter by date
    
    return { totalHours, topSubject, weeklyHours };
  }, []);

  return (
    <DashboardCard
      title="Study"
      icon={BookOpen}
      value={`${stats.totalHours}h`}
      subtitle="Total Study Time"
      trend={{
        value: `${stats.weeklyHours}h this week`,
        isPositive: true
      }}
      gradient="bg-gradient-primary"
    >
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/70">Top Subject</span>
          <span className="font-semibold text-white">{stats.topSubject}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Sessions</span>
          <span className="font-semibold text-white">{mockStudySessions.length}</span>
        </div>
      </div>
    </DashboardCard>
  );
};