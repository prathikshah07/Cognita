import { Transaction, StudySession, SleepRecord } from '../types';

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 3500,
    category: 'Salary',
    type: 'income',
    date: '2024-01-15',
    note: 'Monthly salary'
  },
  {
    id: '2',
    amount: 1200,
    category: 'Rent',
    type: 'expense',
    date: '2024-01-01',
    note: 'Monthly rent payment'
  },
  {
    id: '3',
    amount: 450,
    category: 'Groceries',
    type: 'expense',
    date: '2024-01-10',
    note: 'Weekly shopping'
  },
  {
    id: '4',
    amount: 200,
    category: 'Freelance',
    type: 'income',
    date: '2024-01-12',
    note: 'Web design project'
  },
  {
    id: '5',
    amount: 80,
    category: 'Entertainment',
    type: 'expense',
    date: '2024-01-14',
    note: 'Cinema and dinner'
  }
];

export const mockStudySessions: StudySession[] = [
  {
    id: '1',
    subject: 'React Development',
    duration: 120,
    date: '2024-01-15'
  },
  {
    id: '2',
    subject: 'Machine Learning',
    duration: 90,
    date: '2024-01-14'
  },
  {
    id: '3',
    subject: 'React Development',
    duration: 150,
    date: '2024-01-13'
  },
  {
    id: '4',
    subject: 'Data Structures',
    duration: 75,
    date: '2024-01-12'
  },
  {
    id: '5',
    subject: 'Machine Learning',
    duration: 105,
    date: '2024-01-11'
  }
];

export const mockSleepRecords: SleepRecord[] = [
  {
    id: '1',
    bedtime: '23:30',
    wakeTime: '07:00',
    date: '2024-01-15',
    duration: 7.5
  },
  {
    id: '2',
    bedtime: '00:15',
    wakeTime: '07:30',
    date: '2024-01-14',
    duration: 7.25
  },
  {
    id: '3',
    bedtime: '23:00',
    wakeTime: '06:45',
    date: '2024-01-13',
    duration: 7.75
  },
  {
    id: '4',
    bedtime: '23:45',
    wakeTime: '07:15',
    date: '2024-01-12',
    duration: 7.5
  },
  {
    id: '5',
    bedtime: '00:00',
    wakeTime: '07:00',
    date: '2024-01-11',
    duration: 7
  }
];