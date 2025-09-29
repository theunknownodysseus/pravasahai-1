import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://efdsfdfruckskytgjhht.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZHNmZGZydWNrc2t5dGdqaGh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMTE4NTcsImV4cCI6MjA3NDY4Nzg1N30.ffGdshUXV_XyMQuctyuvmrelYmeLUXb7rB5bABmy-eI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database type definitions
export interface District {
  id: string;
  district_name: string;
  region: string;
  coordinates: { lat: number; lon: number };
  demographics: {
    population_2023: number;
    total_emigrants_2023: number;
    migrant_density_per_1000: number;
  };
  infrastructure: {
    piped_water_pct: number;
    own_well_pct: number;
    community_water_pct: number;
  };
  risk_ratings: {
    water_risk: number;
    sanitation_risk: number;
    crowding_risk: number;
    overall_risk: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Hospital {
  id: string;
  hospital_id: string;
  name: string;
  district: string;
  type: string;
  bed_capacity: number;
  coordinates: { lat: number; lon: number };
  monthly_capacity: number;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  patient_id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  migrant: boolean;
  hospital_id: string;
  district: string;
  contact_number?: string;
  address?: string;
  last_checkup?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface DiseaseCase {
  id: string;
  case_id: string;
  patient_id: string;
  hospital_id: string;
  district: string;
  disease_name: string;
  disease_category: string;
  admission_date: string;
  is_migrant_patient: boolean;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  outcome?: 'Recovered' | 'Under Treatment' | 'Deceased' | 'Transferred';
  district_risk_at_admission?: {
    water_risk: number;
    crowding_risk: number;
    overall_risk: number;
  };
  symptoms?: string[];
  treatment_plan?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'government_official' | 'doctor' | 'migrant';
  district?: string;
  hospital_id?: string;
  created_at: string;
  updated_at: string;
}