import { useEffect, useState, useMemo } from "react";
import { DashboardCard } from "../dashboard/DashboardCard";
import { Moon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
import { SleepRecord } from "@/types";

export const SleepOverview = () => {
  const user = useUser();
  const [records, setRecords] = useState<SleepRecord[]>([]);

  // Fetch recent sleep records
  useEffect(() => {
    if (!user) return;

    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from("sleep_records")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(7); // latest week

      if (error) {
        console.error("Error fetching sleep records:", error.message);
      } else {
        setRecords(data || []);
      }
    };

    fetchRecords();
  }, [user]);

  // Calculate stats
  const stats = useMemo(() => {
    if (records.length === 0) {
      return { averageHours: 0, lastNightHours: 0, weeklyAverage: 0 };
    }

    const totalHours = records.reduce(
      (sum, record) => sum + (record.duration || 0),
      0
    );
    const averageHours = Math.round((totalHours / records.length) * 10) / 10;
    const lastNightHours = records[0]?.duration || 0;

    return { averageHours, lastNightHours, weeklyAverage: averageHours };
  }, [records]);

  const getQualityLabel = (hours: number) => {
    if (hours >= 7 && hours <= 9) return "Good";
    if (hours >= 6) return "Fair";
    return "Poor";
  };

  return (
    <DashboardCard
      title="Sleep"
      icon={Moon}
      value={`${stats.lastNightHours}h`}
      subtitle="Last Night"
      trend={{
        value: `${stats.averageHours}h avg`,
        isPositive: stats.averageHours >= 7,
      }}
      gradient="bg-gradient-warning"
    >
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/70">Weekly Average</span>
          <span className="font-semibold text-white">
            {stats.weeklyAverage}h
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Sleep Quality</span>
          <span className="font-semibold text-white">
            {getQualityLabel(stats.averageHours)}
          </span>
        </div>
      </div>
    </DashboardCard>
  );
};
