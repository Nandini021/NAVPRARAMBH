import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ?? import.meta.env.VITE_SUPABASE_ANON_KEY
) as string;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('Supabase env vars missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ─── Types ──────────────────────────────────────────────────────
export type UserRole = 'student' | 'company' | 'recruiter' | 'college' | 'placement_officer' | 'mentor' | 'trainer' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  college: string | null;
  degree: string | null;
  graduation_year: number | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  language: string;
  notifications_jobs: boolean;
  notifications_courses: boolean;
  notifications_ai: boolean;
  notifications_email: boolean;
  notifications_sms: boolean;
}

export interface Job {
  id: string;
  company_id: string | null;
  posted_by: string;
  title: string;
  description: string | null;
  mode: 'remote' | 'hybrid' | 'onsite';
  type: 'full_time' | 'part_time' | 'contract';
  category: 'government' | 'private' | 'international';
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  experience_min: number | null;
  experience_max: number | null;
  skills: string[];
  education: string | null;
  apply_url: string | null;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
  company?: { name: string; logo_url: string | null } | null;
}

export interface Internship {
  id: string;
  company_id: string | null;
  posted_by: string;
  title: string;
  description: string | null;
  mode: 'remote' | 'hybrid' | 'onsite';
  duration_months: number | null;
  stipend_monthly: number | null;
  has_ppo: boolean;
  skills: string[];
  deadline: string | null;
  apply_url: string | null;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
  company?: { name: string; logo_url: string | null } | null;
}

export interface PMInternship {
  id: string;
  title: string;
  organization: string;
  description: string | null;
  domain: string | null;
  skills: string[];
  location: string | null;
  state: string | null;
  work_mode: string | null;
  duration_months: number | null;
  stipend_monthly: number | null;
  eligibility: string | null;
  apply_url: string | null;
  source_url: string;
  source_type: string;
  verified_at: string;
  status: 'active' | 'expired' | 'needs_review';
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  category: string | null;
  instructor: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number | null;
  rating: number;
  price: number | null;
  thumbnail_url: string | null;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface Career {
  id: string;
  title: string;
  category: string | null;
  emoji: string | null;
  description: string | null;
  salary_min: number | null;
  salary_max: number | null;
  growth: string | null;
  skills: string[];
  roadmap_steps: string[];
  created_at: string;
}

export interface Game {
  id: string;
  name: string;
  emoji: string | null;
  description: string | null;
  difficulty: string | null;
  xp_reward: number;
  category: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string | null;
  description: string | null;
  xp_required: number;
  created_at: string;
}

export interface CareerScore {
  id: string;
  user_id: string;
  career_score: number;
  placement_readiness: number;
  resume_score: number;
  ats_score: number;
  interview_readiness: number;
  xp: number;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  type: 'daily' | 'weekly';
  completed: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  text: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tech_stack: string[];
  status: 'completed' | 'in_progress';
  project_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed: boolean;
  enrolled_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface RoadmapTemplate {
  id: string;
  title: string;
  description: string | null;
  career_id: string | null;
  steps: Array<{ title?: string; step?: string; description?: string; completed?: boolean }>;
  is_development_seed: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentSkill {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  proficiency: number;
  created_at: string;
  updated_at: string;
}

export interface ResumeVersion {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  file_url: string | null;
  is_current: boolean;
  created_at: string;
}

export interface ResumeAnalysis {
  id: string;
  user_id: string;
  resume_version_id: string;
  ats_score: number | null;
  recommendations: unknown[];
  is_trusted: boolean;
  analyzed_at: string;
}

export interface MockInterviewSession {
  id: string;
  user_id: string;
  interview_type: string;
  metadata: Record<string, unknown>;
  score: number | null;
  feedback: unknown[];
  completed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface GovernmentOpportunity {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  opportunity_type: 'portal' | 'scheme' | 'program' | 'scholarship' | 'initiative';
  official_source_name: string;
  official_source_url: string;
  application_url: string | null;
  eligibility: string | null;
  benefits: string | null;
  amount: string | null;
  deadline: string | null;
  is_active: boolean;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CertificationCatalogItem {
  id: string;
  provider: string;
  name: string;
  description: string | null;
  level: string | null;
  domain: string | null;
  credential_url: string | null;
  is_development_seed: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: string;
  entity_id: string | null;
  value: number | null;
  metadata: Record<string, unknown>;
  occurred_at: string;
}
