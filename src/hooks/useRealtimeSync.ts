import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Transaction, SleepLog, StudySession } from '../types';

interface UseRealtimeSyncProps {
  onTransactionChange: (transaction: Transaction) => void;
  onTransactionDelete: (id: string) => void;
  onSleepLogChange: (log: SleepLog) => void;
  onSleepLogDelete: (id: string) => void;
  onStudySessionChange: (session: StudySession) => void;
}

export function useRealtimeSync({
  onTransactionChange,
  onTransactionDelete,
  onSleepLogChange,
  onSleepLogDelete,
  onStudySessionChange,
}: UseRealtimeSyncProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const transactionsChannel = supabase
      .channel('finance_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'finance_transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newTransaction = payload.new as any;
          onTransactionChange({
            id: newTransaction.id,
            title: newTransaction.title,
            amount: newTransaction.amount,
            category: newTransaction.category,
            date: newTransaction.date,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'finance_transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          onTransactionDelete(payload.old.id);
        }
      )
      .subscribe();

    const sleepLogsChannel = supabase
      .channel('sleep_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sleep_logs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newLog = payload.new as any;
          onSleepLogChange({
            id: newLog.id,
            date: newLog.date,
            sleepTime: newLog.sleep_time,
            wakeTime: newLog.wake_time,
            totalHours: newLog.total_hours,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'sleep_logs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          onSleepLogDelete(payload.old.id);
        }
      )
      .subscribe();

    const studySessionsChannel = supabase
      .channel('study_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'study_sessions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newSession = payload.new as any;
          onStudySessionChange({
            id: newSession.id,
            date: newSession.date,
            durationMinutes: newSession.duration_minutes,
            goalMinutes: newSession.goal_minutes,
          });
        }
      )
      .subscribe();

    return () => {
      transactionsChannel.unsubscribe();
      sleepLogsChannel.unsubscribe();
      studySessionsChannel.unsubscribe();
    };
  }, [user, onTransactionChange, onTransactionDelete, onSleepLogChange, onSleepLogDelete, onStudySessionChange]);
}
