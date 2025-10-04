import { DashboardCard } from '../dashboard/DashboardCard';
import { Moon } from 'lucide-react';
import { useSleepRecords } from '@/hooks/useSleepRecords';
import { useMemo } from 'react';

export const SleepOverview = () => {
  const { data: sleepRecords = [], isLoading } = useSleepRecords();

  const stats = useMemo(() => {
    if (sleepRecords.length === 0) {
      return { averageHours: 0, lastNightHours: 0, weeklyAverage: 0 };
    }

    const totalHours = sleepRecords.reduce((sum, record) => sum + Number(record.hours), 0);
    const averageHours = Math.round(totalHours / sleepRecords.length * 10) / 10;
    const lastNightHours = Number(sleepRecords[0]?.hours) || 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyRecords = sleepRecords.filter(r => new Date(r.date) >= weekAgo);
    const weeklyTotal = weeklyRecords.reduce((sum, r) => sum + Number(r.hours), 0);
    const weeklyAverage = weeklyRecords.length > 0
      ? Math.round(weeklyTotal / weeklyRecords.length * 10) / 10
      : 0;

    return { averageHours, lastNightHours, weeklyAverage };
  }, [sleepRecords]);

  const getQualityColor = (hours: number) => {
    if (hours >= 7 && hours <= 9) return 'text-success';
    if (hours >= 6 && hours < 7) return 'text-warning';
    return 'text-destructive';
  };

  if (isLoading) {
    return (
      <DashboardCard
        title="Sleep"
        icon={Moon}
        value="Loading..."
        subtitle="Last Night"
        gradient="bg-gradient-warning"
      />
    );
  }

  return (
    <DashboardCard
      title="Sleep"
      icon={Moon}
      value={`${stats.lastNightHours}h`}
      subtitle="Last Night"
      trend={{
        value: `${stats.averageHours}h avg`,
        isPositive: stats.averageHours >= 7
      }}
      gradient="bg-gradient-warning"
    >
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/70">Weekly Average</span>
          <span className={`font-semibold text-white`}>{stats.weeklyAverage}h</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Sleep Quality</span>
          <span className={`font-semibold text-white`}>
            {stats.averageHours >= 7 && stats.averageHours <= 9 ? 'Good' :
             stats.averageHours >= 6 ? 'Fair' : 'Poor'}
          </span>
        </div>
      </div>
    </DashboardCard>
  );
};