/*
  # Initial Schema for Student Life Management App

  ## Overview
  Creates tables for managing student life including study sessions, sleep tracking, 
  financial transactions, budgets, notes, and user profiles.

  ## New Tables
  
  ### 1. profiles
  - `id` (uuid, primary key) - User ID
  - `name` (text) - User's full name
  - `email` (text) - User's email address
  - `avatar_url` (text, nullable) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. study_sessions
  - `id` (uuid, primary key) - Session ID
  - `user_id` (uuid, foreign key) - Reference to profiles
  - `subject` (text) - Subject studied
  - `duration` (integer) - Duration in minutes
  - `date` (date) - Session date
  - `notes` (text, nullable) - Session notes
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. sleep_records
  - `id` (uuid, primary key) - Record ID
  - `user_id` (uuid, foreign key) - Reference to profiles
  - `date` (date) - Sleep date
  - `hours` (numeric) - Hours slept
  - `quality` (integer) - Sleep quality rating (1-5)
  - `notes` (text, nullable) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. transactions
  - `id` (uuid, primary key) - Transaction ID
  - `user_id` (uuid, foreign key) - Reference to profiles
  - `amount` (numeric) - Transaction amount
  - `category` (text) - Transaction category
  - `description` (text) - Transaction description
  - `date` (date) - Transaction date
  - `type` (text) - Transaction type (income/expense)
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. budgets
  - `id` (uuid, primary key) - Budget ID
  - `user_id` (uuid, foreign key) - Reference to profiles
  - `category` (text) - Budget category
  - `amount` (numeric) - Budget amount
  - `period` (text) - Budget period (weekly/monthly)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. notes
  - `id` (uuid, primary key) - Note ID
  - `user_id` (uuid, foreign key) - Reference to profiles
  - `title` (text) - Note title
  - `content` (text) - Note content
  - `category` (text, nullable) - Note category
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled on all tables
  - Policies allow authenticated users to manage only their own data
  - SELECT, INSERT, UPDATE, DELETE policies created for each table
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  duration integer NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own study sessions"
  ON study_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own study sessions"
  ON study_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own study sessions"
  ON study_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own study sessions"
  ON study_sessions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create sleep_records table
CREATE TABLE IF NOT EXISTS sleep_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  hours numeric NOT NULL DEFAULT 0,
  quality integer NOT NULL DEFAULT 3,
  notes text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT quality_range CHECK (quality >= 1 AND quality <= 5)
);

ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sleep records"
  ON sleep_records FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sleep records"
  ON sleep_records FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sleep records"
  ON sleep_records FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own sleep records"
  ON sleep_records FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  category text NOT NULL,
  description text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL DEFAULT 'expense',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT type_check CHECK (type IN ('income', 'expense'))
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  period text NOT NULL DEFAULT 'monthly',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT period_check CHECK (period IN ('weekly', 'monthly'))
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS study_sessions_date_idx ON study_sessions(date);
CREATE INDEX IF NOT EXISTS sleep_records_user_id_idx ON sleep_records(user_id);
CREATE INDEX IF NOT EXISTS sleep_records_date_idx ON sleep_records(date);
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);
CREATE INDEX IF NOT EXISTS budgets_user_id_idx ON budgets(user_id);
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);