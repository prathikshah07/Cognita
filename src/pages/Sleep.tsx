// app/sleep.tsx
import { useState, useMemo, useEffect } from "react";
import { SleepForm } from "@/components/sleep/SleepForm";
import { SleepList } from "@/components/sleep/SleepList";
import { SleepGoals } from "@/components/sleep/SleepGoals";
import { ExportData } from "@/components/shared/ExportData";
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import { SearchBar } from "@/components/shared/SearchBar";
import { Card } from "@/components/ui/card";
import { SleepRecord, SleepGoal } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { SleepOverview } from "@/components/sleep/SleepOverview";

const Sleep = () => {
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [sleepGoal, setSleepGoal] = useState<SleepGoal>({
    targetHours: 8,
    targetBedtime: "22:00",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch sleep records
  const fetchSleepRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sleep_records")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
      setErrorMsg("");
    } catch (err: any) {
      console.error("Error fetching sleep records:", err.message);
      setErrorMsg("Failed to load sleep records from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSleepRecords();
  }, []);

  const handleAddRecord = async (newRecord: Omit<SleepRecord, "id">) => {
    try {
      const { data, error } = await supabase
        .from("sleep_records")
        .insert([
          {
            bedtime: newRecord.bedtime,
            wake_time: newRecord.wakeTime,
            date: newRecord.date,
            duration: newRecord.duration,
            quality: newRecord.quality,
            notes: newRecord.notes,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setRecords((prev) => [data, ...prev]);
      setErrorMsg("");
    } catch (err: any) {
      console.error("Error adding sleep record:", err.message);
      setErrorMsg("Failed to add sleep record.");
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from("sleep_records")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setErrorMsg("");
    } catch (err: any) {
      console.error("Error deleting sleep record:", err.message);
      setErrorMsg("Failed to delete sleep record.");
    }
  };

  // Filters
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch = r.notes
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const recordDate = new Date(r.date);
      const matchesDateRange =
        (!startDate || recordDate >= new Date(startDate)) &&
        (!endDate || recordDate <= new Date(endDate));
      return matchesSearch && matchesDateRange;
    });
  }, [records, searchQuery, startDate, endDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading sleep records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Sleep Tracker
            </h1>
            <p className="text-muted-foreground">
              Monitor your sleep patterns and quality
            </p>
          </div>
          <ExportData
            data={filteredRecords}
            filename="sleep-records"
            label="Export"
          />
        </div>

        {/* Overview Section */}
        <SleepOverview
          records={filteredRecords}
          goal={sleepGoal}
          onUpdateGoal={setSleepGoal}
        />

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

        {/* Add & List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SleepForm onAdd={handleAddRecord} />
          <SleepList records={filteredRecords} onDelete={handleDeleteRecord} />
        </div>

        {/* Error Message */}
        {errorMsg && <p className="text-red-500 mt-4">{errorMsg}</p>}
      </main>
    </div>
  );
};

export default Sleep;
