export interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  note?: string;
  recurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'monthly' | 'weekly';
}

export interface StudySession {
  id: string;
  subject: string;
  duration: number; // in minutes
  date: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface StudyGoal {
  id: string;
  subject: string;
  targetHours: number;
  deadline: string;
  completed?: boolean;
}

export interface SleepRecord {
  id: string;
  bedtime: string;
  wakeTime: string;
  date: string;
  duration?: number; // calculated in hours
  quality?: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
}

export interface SleepGoal {
  targetHours: number;
  targetBedtime: string;
}

export interface DashboardStats {
  finance: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    monthlyBalance: number;
  };
  study: {
    totalHours: number;
    weeklyHours: number;
    topSubject: string;
  };
  sleep: {
    averageHours: number;
    weeklyAverage: number;
    lastNightHours: number;
  };
}