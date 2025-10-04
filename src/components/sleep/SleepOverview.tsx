import { DashboardCard } from '../dashboard/DashboardCard';
import { Moon } from 'lucide-react';
import { mockSleepRecords } from '@/data/mockData';
import { useMemo } from 'react';

export const SleepOverview = () => {
  const stats = useMemo(() => {
    const totalHours = mockSleepRecords.reduce((sum, record) => sum + (record.duration || 0), 0);
    const averageHours = Math.round(totalHours / mockSleepRecords.length * 10) / 10;
    const lastNightHours = mockSleepRecords[0]?.duration || 0;
    
    return { averageHours, lastNightHours, weeklyAverage: averageHours };
  }, []);

  const getQualityColor = (hours: number) => {
    if (hours >= 7 && hours <= 9) return 'text-success';
    if (hours >= 6 && hours < 7) return 'text-warning';
    return 'text-destructive';
  };

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