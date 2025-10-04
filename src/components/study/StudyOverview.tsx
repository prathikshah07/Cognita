import { useEffect, useState, useMemo } from "react";
import { DashboardCard } from "../dashboard/DashboardCard";
import { BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; // Make sure your client is set up
import { StudySession } from "@/types";

export const StudyOverview = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch study sessions from Supabase
  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from<'study_sessions', StudySession>("study_sessions")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching sessions:", error.message);
      setError(error.message);
    } else {
      setSessions(data || []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const stats = useMemo(() => {
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    const subjectTotals = sessions.reduce((acc, s) => {
      acc[s.subject] = (acc[s.subject] || 0) + s.duration;
      return acc;
    }, {} as Record<string, number>);

    const topSubject =
      Object.entries(subjectTotals).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "None";

    // Weekly hours (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyMinutes = sessions
      .filter((s) => new Date(s.date) >= oneWeekAgo)
      .reduce((sum, s) => sum + s.duration, 0);

    const weeklyHours = Math.round((weeklyMinutes / 60) * 10) / 10;

    return { totalHours, topSubject, weeklyHours };
  }, [sessions]);

  if (loading) {
    return (
      <DashboardCard
        title="Study"
        icon={BookOpen}
        value="Loading..."
        subtitle=""
        gradient="bg-gradient-primary"
      >
        <div className="text-white/70 text-sm">Fetching study sessions...</div>
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard
        title="Study"
        icon={BookOpen}
        value="Error"
        subtitle=""
        gradient="bg-gradient-primary"
      >
        <div className="text-red-400 text-sm">{error}</div>
      </DashboardCard>
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
        isPositive: true,
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
          <span className="font-semibold text-white">{sessions.length}</span>
        </div>
      </div>
    </DashboardCard>
  );
};
