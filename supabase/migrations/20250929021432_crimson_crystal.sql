/*
  # Kerala Migrant Health Dashboard - Initial Database Schema

  1. New Tables
    - `districts` - Kerala district information with demographics and risk ratings
    - `hospitals` - Hospital information with capacity and location data
    - `patients` - Patient records with migrant status and health data
    - `disease_cases` - Disease case tracking with severity and outcomes
    - `user_profiles` - Extended user profile information with roles

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Doctors can manage patients in their district
    - Government officials have full read access
    - Users can only access their own profile data

  3. Indexes and Constraints
    - Foreign key relationships between tables
    - Indexes on frequently queried columns
    - Check constraints for data validation
*/

-- Create districts table
CREATE TABLE IF NOT EXISTS districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_name text UNIQUE NOT NULL,
  region text NOT NULL,
  coordinates jsonb NOT NULL,
  demographics jsonb NOT NULL,
  infrastructure jsonb NOT NULL,
  risk_ratings jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id text UNIQUE NOT NULL,
  name text NOT NULL,
  district text NOT NULL,
  type text NOT NULL,
  bed_capacity integer NOT NULL DEFAULT 0,
  coordinates jsonb NOT NULL,
  monthly_capacity integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (district) REFERENCES districts(district_name)
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('government_official', 'doctor', 'migrant')),
  district text,
  hospital_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (district) REFERENCES districts(district_name),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id text UNIQUE NOT NULL,
  name text NOT NULL,
  age integer NOT NULL CHECK (age > 0 AND age < 120),
  gender text NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  migrant boolean DEFAULT false,
  hospital_id text NOT NULL,
  district text NOT NULL,
  contact_number text,
  address text,
  last_checkup timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id),
  FOREIGN KEY (district) REFERENCES districts(district_name)
);

-- Create disease_cases table
CREATE TABLE IF NOT EXISTS disease_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id text UNIQUE NOT NULL,
  patient_id text NOT NULL,
  hospital_id text NOT NULL,
  district text NOT NULL,
  disease_name text NOT NULL,
  disease_category text NOT NULL,
  admission_date timestamptz NOT NULL,
  is_migrant_patient boolean DEFAULT false,
  severity text NOT NULL CHECK (severity IN ('Mild', 'Moderate', 'Severe', 'Critical')),
  outcome text CHECK (outcome IN ('Recovered', 'Under Treatment', 'Deceased', 'Transferred')),
  district_risk_at_admission jsonb,
  symptoms text[],
  treatment_plan text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id),
  FOREIGN KEY (district) REFERENCES districts(district_name)
);

-- Enable RLS on all tables
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for districts (readable by authenticated users)
CREATE POLICY "Districts are viewable by authenticated users"
  ON districts FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for hospitals (readable by authenticated users)
CREATE POLICY "Hospitals are viewable by authenticated users"
  ON hospitals FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for patients
CREATE POLICY "Government officials can view all patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'government_official'
    )
  );

CREATE POLICY "Doctors can view patients in their district"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'doctor' 
      AND user_profiles.district = patients.district
    )
  );

CREATE POLICY "Doctors can manage patients in their district"
  ON patients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'doctor' 
      AND user_profiles.district = patients.district
    )
  );

-- RLS Policies for disease_cases
CREATE POLICY "Government officials can view all disease cases"
  ON disease_cases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'government_official'
    )
  );

CREATE POLICY "Doctors can view cases in their district"
  ON disease_cases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'doctor' 
      AND user_profiles.district = disease_cases.district
    )
  );

CREATE POLICY "Doctors can manage cases in their district"
  ON disease_cases FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'doctor' 
      AND user_profiles.district = disease_cases.district
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_district ON patients(district);
CREATE INDEX IF NOT EXISTS idx_patients_hospital ON patients(hospital_id);
CREATE INDEX IF NOT EXISTS idx_patients_migrant ON patients(migrant);
CREATE INDEX IF NOT EXISTS idx_disease_cases_district ON disease_cases(district);
CREATE INDEX IF NOT EXISTS idx_disease_cases_disease ON disease_cases(disease_name);
CREATE INDEX IF NOT EXISTS idx_disease_cases_admission_date ON disease_cases(admission_date);
CREATE INDEX IF NOT EXISTS idx_disease_cases_migrant ON disease_cases(is_migrant_patient);