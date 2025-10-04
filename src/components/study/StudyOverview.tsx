import { DashboardCard } from '../dashboard/DashboardCard';
import { BookOpen } from 'lucide-react';
import { useStudySessions } from '@/hooks/useStudySessions';
import { useMemo } from 'react';

export const StudyOverview = () => {
  const { data: studySessions = [], isLoading } = useStudySessions();

  const stats = useMemo(() => {
    const totalMinutes = studySessions.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

    const subjectCounts = studySessions.reduce((acc, session) => {
      acc[session.subject] = (acc[session.subject] || 0) + session.duration;
      return acc;
    }, {} as Record<string, number>);

    const topSubject = Object.entries(subjectCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyMinutes = studySessions
      .filter(s => new Date(s.date) >= weekAgo)
      .reduce((sum, s) => sum + s.duration, 0);
    const weeklyHours = Math.round(weeklyMinutes / 60 * 10) / 10;

    return { totalHours, topSubject, weeklyHours, sessionCount: studySessions.length };
  }, [studySessions]);

  if (isLoading) {
    return (
      <DashboardCard
        title="Study"
        icon={BookOpen}
        value="Loading..."
        subtitle="Total Study Time"
        gradient="bg-gradient-primary"
      />
    );
  }

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
          <span className="font-semibold text-white">{stats.sessionCount}</span>
        </div>
      </div>
    </DashboardCard>
  );
};