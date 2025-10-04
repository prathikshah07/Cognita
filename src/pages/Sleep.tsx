import { useState, useMemo } from 'react';
import { SleepForm } from '@/components/sleep/SleepForm';
import { SleepList } from '@/components/sleep/SleepList';
import { SleepGoals } from '@/components/sleep/SleepGoals';
import { ExportData } from '@/components/shared/ExportData';
import { DateRangeFilter } from '@/components/shared/DateRangeFilter';
import { SearchBar } from '@/components/shared/SearchBar';
import { Card } from '@/components/ui/card';
import { SleepGoal } from '@/types';
import { useSleepRecords, useAddSleepRecord, useDeleteSleepRecord } from '@/hooks/useSleepRecords';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Sleep = () => {
  const { data: records = [], isLoading } = useSleepRecords();
  const addRecord = useAddSleepRecord();
  const deleteRecord = useDeleteSleepRecord();
  const [sleepGoal, setSleepGoal] = useState<SleepGoal>({
    targetHours: 8,
    targetBedtime: '22:00'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleAddRecord = async (newRecord: { date: string; hours: number; quality: number; notes?: string }) => {
    try {
      await addRecord.mutateAsync(newRecord);
      toast.success('Sleep record added successfully');
    } catch (error) {
      toast.error('Failed to add sleep record');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteRecord.mutateAsync(id);
      toast.success('Sleep record deleted');
    } catch (error) {
      toast.error('Failed to delete sleep record');
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = r.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      const recordDate = new Date(r.date);
      const matchesDateRange = (!startDate || recordDate >= new Date(startDate)) &&
        (!endDate || recordDate <= new Date(endDate));
      return matchesSearch && matchesDateRange;
    });
  }, [records, searchQuery, startDate, endDate]);

  const stats = useMemo(() => {
    const totalHours = filteredRecords.reduce((sum, record) => sum + Number(record.hours), 0);
    const averageHours = filteredRecords.length > 0 ? Math.round(totalHours / filteredRecords.length * 10) / 10 : 0;
    const lastNightHours = Number(filteredRecords[0]?.hours) || 0;
    
    const chartData = filteredRecords
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(record => ({
        date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: Number(record.hours)
      }));

    const qualityDistribution = filteredRecords.reduce((acc, record) => {
      const quality = record.quality;
      if (quality === 5) acc.excellent++;
      else if (quality === 4) acc.good++;
      else if (quality === 3) acc.fair++;
      else acc.poor++;
      return acc;
    }, { poor: 0, fair: 0, good: 0, excellent: 0 } as Record<string, number>);

    return { totalHours, averageHours, lastNightHours, chartData, qualityDistribution };
  }, [filteredRecords]);

  const getQualityPercentage = (count: number) => {
    return filteredRecords.length > 0 ? Math.round((count / filteredRecords.length) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sleep Tracker</h1>
            <p className="text-muted-foreground">Monitor your sleep patterns and quality</p>
          </div>
          <ExportData data={filteredRecords} filename="sleep-records" label="Export" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-lg bg-gradient-warning text-white">
            <div className="text-sm opacity-90">Last Night</div>
            <div className="text-2xl font-bold">{stats.lastNightHours}h</div>
          </div>
          <div className="p-6 rounded-lg bg-gradient-warning text-white">
            <div className="text-sm opacity-90">Average Sleep</div>
            <div className="text-2xl font-bold">{stats.averageHours}h</div>
          </div>
          <div className="p-6 rounded-lg bg-gradient-warning text-white">
            <div className="text-sm opacity-90">Total Records</div>
            <div className="text-2xl font-bold">{filteredRecords.length}</div>
          </div>
          <div className="p-6 rounded-lg bg-gradient-warning text-white">
            <div className="text-sm opacity-90">Sleep Goal</div>
            <div className="text-2xl font-bold">{sleepGoal.targetHours}h</div>
          </div>
        </div>

        {/* Sleep Goals */}
        <div className="mb-8">
          <SleepGoals
            goal={sleepGoal}
            onUpdate={setSleepGoal}
            averageSleep={stats.averageHours}
          />
        </div>

        {/* Sleep Trend Chart */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Sleep Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                domain={[0, 12]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="hsl(38 92% 50%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(38 92% 50%)', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Sleep Quality Distribution */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Sleep Quality Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-success/10">
              <div className="text-2xl font-bold text-success">{getQualityPercentage(stats.qualityDistribution.excellent || 0)}%</div>
              <div className="text-sm text-muted-foreground">Excellent</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-success/10">
              <div className="text-2xl font-bold text-success">{getQualityPercentage(stats.qualityDistribution.good || 0)}%</div>
              <div className="text-sm text-muted-foreground">Good</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-warning/10">
              <div className="text-2xl font-bold text-warning">{getQualityPercentage(stats.qualityDistribution.fair || 0)}%</div>
              <div className="text-sm text-muted-foreground">Fair</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <div className="text-2xl font-bold text-destructive">{getQualityPercentage(stats.qualityDistribution.poor || 0)}%</div>
              <div className="text-sm text-muted-foreground">Poor</div>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search notes..."
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
          <SleepForm onAdd={handleAddRecord} />
          <SleepList 
            records={filteredRecords}
            onDelete={handleDeleteRecord}
          />
        </div>
      </main>
    </div>
  );
};

export default Sleep;
