import { useState, useMemo } from 'react';
import { StudyForm } from '@/components/study/StudyForm';
import { StudyList } from '@/components/study/StudyList';
import { StudyGoals } from '@/components/study/StudyGoals';
import { PomodoroTimer } from '@/components/study/PomodoroTimer';
import { ExportData } from '@/components/shared/ExportData';
import { DateRangeFilter } from '@/components/shared/DateRangeFilter';
import { SearchBar } from '@/components/shared/SearchBar';
import { Card } from '@/components/ui/card';
import { StudyGoal } from '@/types';
import { useStudySessions, useAddStudySession, useDeleteStudySession } from '@/hooks/useStudySessions';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Study = () => {
  const { data: sessions = [], isLoading } = useStudySessions();
  const addSession = useAddStudySession();
  const deleteSession = useDeleteStudySession();
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleAddSession = async (newSession: { subject: string; duration: number; date: string; notes?: string }) => {
    try {
      await addSession.mutateAsync(newSession);
      toast.success('Study session added successfully');
    } catch (error) {
      toast.error('Failed to add study session');
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession.mutateAsync(id);
      toast.success('Study session deleted');
    } catch (error) {
      toast.error('Failed to delete study session');
    }
  };

  const handleAddGoal = (newGoal: Omit<StudyGoal, 'id'>) => {
    const goal: StudyGoal = {
      ...newGoal,
      id: Date.now().toString()
    };
    setGoals(prev => [...prev, goal]);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleToggleGoalComplete = (id: string) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, completed: !g.completed } : g
    ));
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchesSearch = s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      const sessionDate = new Date(s.date);
      const matchesDateRange = (!startDate || sessionDate >= new Date(startDate)) &&
        (!endDate || sessionDate <= new Date(endDate));
      return matchesSearch && matchesDateRange;
    });
  }, [sessions, searchQuery, startDate, endDate]);

  const stats = useMemo(() => {
    const totalMinutes = filteredSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
    
    const subjectTotals = filteredSessions.reduce((acc, session) => {
      acc[session.subject] = (acc[session.subject] || 0) + session.duration;
      return acc;
    }, {} as Record<string, number>);
    
    const chartData = filteredSessions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(session => ({
        date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: Math.round(session.duration / 60 * 10) / 10
      }));

    return { totalHours, subjectTotals, chartData };
  }, [filteredSessions]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Study Tracker</h1>
            <p className="text-muted-foreground">Log and track your study sessions</p>
          </div>
          <ExportData data={filteredSessions} filename="study-sessions" label="Export" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-lg bg-gradient-primary text-white">
            <div className="text-sm opacity-90">Total Hours</div>
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
          </div>
          <div className="p-6 rounded-lg bg-gradient-primary text-white">
            <div className="text-sm opacity-90">Sessions</div>
            <div className="text-2xl font-bold">{filteredSessions.length}</div>
          </div>
          <div className="p-6 rounded-lg bg-gradient-primary text-white">
            <div className="text-sm opacity-90">Subjects</div>
            <div className="text-2xl font-bold">{Object.keys(stats.subjectTotals).length}</div>
          </div>
          <div className="p-6 rounded-lg bg-gradient-primary text-white">
            <div className="text-sm opacity-90">Avg per Session</div>
            <div className="text-2xl font-bold">
              {filteredSessions.length > 0 ? Math.round(stats.totalHours / filteredSessions.length * 10) / 10 : 0}h
            </div>
          </div>
        </div>

        {/* Pomodoro Timer */}
        <div className="mb-8">
          <PomodoroTimer />
        </div>

        {/* Study Goals */}
        <div className="mb-8">
          <StudyGoals
            goals={goals}
            currentHours={stats.subjectTotals}
            onAdd={handleAddGoal}
            onDelete={handleDeleteGoal}
            onToggleComplete={handleToggleGoalComplete}
          />
        </div>

        {/* Study Time Trend Chart */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Study Time Trend</h3>
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
                stroke="hsl(262 83% 58%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(262 83% 58%)', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Subject Breakdown */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Subject Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(stats.subjectTotals)
              .sort(([,a], [,b]) => b - a)
              .map(([subject, minutes]) => (
                <div key={subject} className="flex justify-between items-center p-2 rounded border border-border">
                  <span className="font-medium">{subject}</span>
                  <span className="text-primary font-semibold">
                    {Math.round(minutes / 60 * 10) / 10}h
                  </span>
                </div>
              ))}
          </div>
        </Card>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by subject or notes..."
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
          <StudyForm onAdd={handleAddSession} />
          <StudyList 
            sessions={filteredSessions}
            onDelete={handleDeleteSession}
          />
        </div>
      </main>
    </div>
  );
};

export default Study;
