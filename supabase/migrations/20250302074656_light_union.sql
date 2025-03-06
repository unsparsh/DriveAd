/*
  # Initial Schema Setup for DriveAds

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `updated_at` (timestamp)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `role` (text)
    - `advertisers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `company_name` (text)
      - `company_address` (text)
      - `gstin` (text)
      - `created_at` (timestamp)
    - `drivers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `vehicle_type` (text)
      - `vehicle_number` (text)
      - `license_number` (text)
      - `is_verified` (boolean)
      - `earnings` (numeric)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
*/

-- Create profiles table that extends the auth.users table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT CHECK (role IN ('advertiser', 'driver', 'admin'))
);

-- Create advertisers table
CREATE TABLE IF NOT EXISTS advertisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  company_address TEXT NOT NULL,
  gstin TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_type TEXT CHECK (vehicle_type IN ('auto', 'car')) NOT NULL,
  vehicle_number TEXT NOT NULL,
  license_number TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  earnings NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for advertisers
CREATE POLICY "Users can view their own advertiser profile"
  ON advertisers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own advertiser profile"
  ON advertisers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own advertiser profile"
  ON advertisers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for drivers
CREATE POLICY "Users can view their own driver profile"
  ON drivers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own driver profile"
  ON drivers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own driver profile"
  ON drivers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();