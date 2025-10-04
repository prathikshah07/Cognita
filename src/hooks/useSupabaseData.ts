import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, SleepLog, StudySession } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useSupabaseData() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('finance_transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }

    setTransactions(
      data.map((t) => ({
        id: t.id,
        title: t.title,
        amount: t.amount,
        category: t.category,
        date: t.date,
      }))
    );
  };

  const fetchSleepLogs = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching sleep logs:', error);
      return;
    }

    setSleepLogs(
      data.map((log) => ({
        id: log.id,
        date: log.date,
        sleepTime: log.sleep_time,
        wakeTime: log.wake_time,
        totalHours: log.total_hours,
      }))
    );
  };

  const fetchStudySessions = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching study sessions:', error);
      return;
    }

    setStudySessions(
      data.map((session) => ({
        id: session.id,
        date: session.date,
        durationMinutes: session.duration_minutes,
        goalMinutes: session.goal_minutes,
      }))
    );
  };

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchTransactions(),
        fetchSleepLogs(),
        fetchStudySessions(),
      ]).then(() => setLoading(false));
    }
  }, [user]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('finance_transactions')
      .insert({
        user_id: user.id,
        title: transaction.title,
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      return;
    }

    setTransactions([
      {
        id: data.id,
        title: data.title,
        amount: data.amount,
        category: data.category,
        date: data.date,
      },
      ...transactions,
    ]);
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('finance_transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      return;
    }

    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const addSleepLog = async (log: Omit<SleepLog, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('sleep_logs')
      .insert({
        user_id: user.id,
        date: log.date,
        sleep_time: log.sleepTime,
        wake_time: log.wakeTime,
        total_hours: log.totalHours,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding sleep log:', error);
      return;
    }

    setSleepLogs([
      {
        id: data.id,
        date: data.date,
        sleepTime: data.sleep_time,
        wakeTime: data.wake_time,
        totalHours: data.total_hours,
      },
      ...sleepLogs,
    ]);
  };

  const deleteSleepLog = async (id: string) => {
    const { error } = await supabase
      .from('sleep_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting sleep log:', error);
      return;
    }

    setSleepLogs(sleepLogs.filter((l) => l.id !== id));
  };

  const addStudySession = async (session: Omit<StudySession, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: user.id,
        date: session.date,
        duration_minutes: session.durationMinutes,
        goal_minutes: session.goalMinutes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding study session:', error);
      return;
    }

    setStudySessions([
      {
        id: data.id,
        date: data.date,
        durationMinutes: data.duration_minutes,
        goalMinutes: data.goal_minutes,
      },
      ...studySessions,
    ]);
  };

  return {
    transactions,
    sleepLogs,
    studySessions,
    loading,
    addTransaction,
    deleteTransaction,
    addSleepLog,
    deleteSleepLog,
    addStudySession,
  };
}
