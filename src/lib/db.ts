import { supabase } from './supabase';
import type { Career, Game, Badge, Job, Internship, PMInternship, Course, CareerScore, Goal, Notification, Project, Enrollment, Profile, UserSettings, RoadmapTemplate, StudentSkill, ResumeVersion, ResumeAnalysis, MockInterviewSession, CertificationCatalogItem, AnalyticsEvent } from './supabase';

// ─── Careers ────────────────────────────────────────────────────
export async function getCareers(category?: string): Promise<Career[]> {
  let query = supabase.from('careers').select('*').order('title');
  if (category && category !== 'All') query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function searchCareers(searchTerm: string): Promise<Career[]> {
  const { data, error } = await supabase
    .from('careers')
    .select('*')
    .or(`title.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
    .order('title');
  if (error) throw error;
  return data ?? [];
}

// ─── Jobs ────────────────────────────────────────────────────────
export async function getJobs(filters?: { mode?: string; category?: string; search?: string }): Promise<Job[]> {
  let query = supabase.from('jobs').select('*, company:companies(name, logo_url)').eq('status', 'active').order('created_at', { ascending: false });
  if (filters?.mode && filters.mode !== 'All') query = query.eq('mode', filters.mode);
  if (filters?.category && filters.category !== 'All') query = query.eq('category', filters.category);
  if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ─── Internships ─────────────────────────────────────────────────
export async function getInternships(filters?: { mode?: string; hasPpo?: boolean }): Promise<Internship[]> {
  let query = supabase.from('internships').select('*, company:companies(name, logo_url)').eq('status', 'active').order('created_at', { ascending: false });
  if (filters?.mode && filters.mode !== 'All') query = query.eq('mode', filters.mode);
  if (filters?.hasPpo !== undefined) query = query.eq('has_ppo', filters.hasPpo);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getPMInternships(): Promise<PMInternship[]> {
  const { data, error } = await supabase
    .from('pm_internships')
    .select('*')
    .eq('status', 'active')
    .not('source_url', 'is', null)
    .not('verified_at', 'is', null)
    .order('verified_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PMInternship[];
}

// ─── Courses ─────────────────────────────────────────────────────
export async function getCourses(category?: string): Promise<Course[]> {
  let query = supabase.from('courses').select('*').order('created_at', { ascending: false });
  if (category && category !== 'All') query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

const DEMO_COURSES = [
  { title: 'Python for AI & Data Analytics — NAVPRARAMBH Demo', description: 'Build a practical Python foundation for data cleaning, exploration, and responsible AI workflows through guided student projects.', category: 'AI & Data', instructor: 'Aarohi Demo Faculty', level: 'beginner' as const, duration_hours: 24, rating: 4.8, price: 0, skills: ['Python', 'Pandas', 'Data Analysis'] },
  { title: 'Advanced Excel & Automation — NAVPRARAMBH Demo', description: 'Turn everyday spreadsheets into reliable decision tools with formulas, pivots, data quality checks, and workflow automation.', category: 'Business Analytics', instructor: 'Kabir Demo Faculty', level: 'intermediate' as const, duration_hours: 18, rating: 4.7, price: 0, skills: ['Excel', 'Automation', 'Data Cleaning'] },
  { title: 'Power BI Business Intelligence — NAVPRARAMBH Demo', description: 'Learn to shape business data, design clear dashboards, and communicate insights that help teams make better decisions.', category: 'Business Analytics', instructor: 'Meera Demo Faculty', level: 'intermediate' as const, duration_hours: 20, rating: 4.8, price: 0, skills: ['Power BI', 'DAX', 'Data Visualization'] },
  { title: 'SQL & Database Analytics — NAVPRARAMBH Demo', description: 'Practice joins, aggregations, window functions, and analytical thinking with realistic career-focused data problems.', category: 'Data', instructor: 'Nikhil Demo Faculty', level: 'beginner' as const, duration_hours: 16, rating: 4.9, price: 0, skills: ['SQL', 'PostgreSQL', 'Analytics'] },
  { title: 'Machine Learning Foundations — NAVPRARAMBH Demo', description: 'Understand the end-to-end machine learning workflow, from problem framing and features to evaluation and responsible use.', category: 'Machine Learning', instructor: 'Ira Demo Faculty', level: 'intermediate' as const, duration_hours: 28, rating: 4.8, price: 0, skills: ['Machine Learning', 'scikit-learn', 'Model Evaluation'] },
  { title: 'Natural Language Processing — NAVPRARAMBH Demo', description: 'Explore how computers work with language using text preparation, classification, embeddings, and explainable experiments.', category: 'AI & Data', instructor: 'Dev Demo Faculty', level: 'advanced' as const, duration_hours: 26, rating: 4.7, price: 0, skills: ['NLP', 'Python', 'Embeddings'] },
  { title: 'Generative AI & Prompt Engineering — NAVPRARAMBH Demo', description: 'Design useful prompts, evaluate model outputs, and prototype grounded AI experiences with safety and clarity in mind.', category: 'Generative AI', instructor: 'Tara Demo Faculty', level: 'beginner' as const, duration_hours: 14, rating: 4.8, price: 0, skills: ['Generative AI', 'Prompt Design', 'AI Evaluation'] },
  { title: 'Cybersecurity Fundamentals — NAVPRARAMBH Demo', description: 'Learn core security concepts, common attack surfaces, and practical habits for building safer digital products and careers.', category: 'Cybersecurity', instructor: 'Rohan Demo Faculty', level: 'beginner' as const, duration_hours: 22, rating: 4.6, price: 0, skills: ['Cybersecurity', 'Networking', 'Threat Awareness'] },
  { title: 'Data Visualization & Storytelling — NAVPRARAMBH Demo', description: 'Choose effective charts, build accessible visual narratives, and present evidence with confidence in interviews and projects.', category: 'Data', instructor: 'Anaya Demo Faculty', level: 'intermediate' as const, duration_hours: 15, rating: 4.8, price: 0, skills: ['Data Visualization', 'Storytelling', 'Communication'] },
  { title: 'Resume & ATS Optimization — NAVPRARAMBH Demo', description: 'Create a focused, truthful resume, improve its structure for applicant tracking systems, and prepare stronger evidence for applications.', category: 'Career Skills', instructor: 'Veda Demo Faculty', level: 'beginner' as const, duration_hours: 10, rating: 4.9, price: 0, skills: ['Resume Writing', 'ATS', 'Career Preparation'] },
] as const;

export async function seedDemoCourses(): Promise<{ inserted: number; existing: number }> {
  const userId = await getAuthenticatedUserId();
  const titles = DEMO_COURSES.map((course) => course.title);
  const { data: existingRows, error: existingError } = await supabase
    .from('courses')
    .select('title')
    .eq('created_by', userId)
    .in('title', titles);
  if (existingError) throw existingError;

  const existingTitles = new Set((existingRows ?? []).map((course) => course.title));
  const missingCourses = DEMO_COURSES
    .filter((course) => !existingTitles.has(course.title))
    .map((course) => ({ ...course, created_by: userId }));

  if (missingCourses.length === 0) {
    return { inserted: 0, existing: existingTitles.size };
  }

  const { error: insertError } = await supabase.from('courses').insert(missingCourses);
  if (insertError) throw insertError;
  return { inserted: missingCourses.length, existing: existingTitles.size };
}

// ─── Games ───────────────────────────────────────────────────────
export async function getGames(): Promise<Game[]> {
  const { data, error } = await supabase.from('games').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export interface GameAttemptQuestion {
  id: string;
  prompt: string;
  questionType: string;
  options: string[];
  content: Record<string, unknown>;
  difficulty: string;
  points: number;
}

export interface GameAttempt {
  attemptId: string;
  gameId: string;
  questions: GameAttemptQuestion[];
}

export interface GameAttemptResult {
  attemptId: string;
  status: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  xpEarned: number;
  coinsEarned: number;
}

export async function startGameAttempt(gameId: string, difficulty?: string): Promise<GameAttempt> {
  const { data, error } = await supabase.functions.invoke<GameAttempt>('start-game-attempt', {
    body: { gameId, difficulty: difficulty ?? null },
  });
  if (error) throw error;
  if (!data) throw new Error('The game attempt was not returned by the backend.');
  return data;
}

export async function submitGameAttempt(attemptId: string, answers: Array<{ questionId: string; selectedAnswer: string }>): Promise<GameAttemptResult> {
  const { data, error } = await supabase.functions.invoke<GameAttemptResult>('submit-game-attempt', {
    body: { attemptId, answers },
  });
  if (error) throw error;
  if (!data) throw new Error('The game result was not returned by the backend.');
  return data;
}

export interface GameSessionReward {
  sessionId: string;
  score: number;
  xpEarned: number;
  coinsEarned: number;
  totalXp: number;
  awardedBadgeIds: string[];
}

/**
 * Records a completed game through the protected Edge Function.
 * The browser sends result evidence only; XP and coins are server-calculated.
 */
export async function recordGameSession(
  gameId: string,
  correctAnswers: number,
  totalQuestions: number,
): Promise<GameSessionReward> {
  if (!Number.isInteger(correctAnswers) || !Number.isInteger(totalQuestions)) {
    throw new Error('Game results must use whole numbers.');
  }
  if (totalQuestions <= 0 || correctAnswers < 0 || correctAnswers > totalQuestions) {
    throw new Error('Invalid game result.');
  }

  const { data, error } = await supabase.functions.invoke<GameSessionReward>(
    'record-game-session',
    { body: { gameId, correctAnswers, totalQuestions } },
  );
  if (error) throw error;
  if (!data) throw new Error('The game result was not returned by the backend.');
  return data;
}

// ─── Badges ──────────────────────────────────────────────────────
export async function getBadges(): Promise<Badge[]> {
  const { data, error } = await supabase.from('badges').select('*').order('xp_required');
  if (error) throw error;
  return data ?? [];
}

// ─── Dashboard ──────────────────────────────────────────────────
export async function getCareerScore(userId: string): Promise<CareerScore | null> {
  const { data, error } = await supabase
    .from('career_scores')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface UserCertification {
  id: string;
  user_id: string;
  name: string;
  provider: string;
  issue_date: string | null;
  credential_url: string | null;
  verified: boolean;
  created_at: string;
}

export interface StudentApplication {
  id: string;
  user_id: string;
  job_id: string | null;
  internship_id: string | null;
  status: 'pending' | 'shortlisted' | 'rejected' | 'offered';
  cover_letter: string | null;
  resume_url: string | null;
  created_at: string;
  updated_at: string;
  job?: { title: string; location: string | null; mode: string; skills: string[] | null; company?: { name: string } | null } | null;
  internship?: { title: string; deadline: string | null; mode: string; skills: string[] | null; company?: { name: string } | null } | null;
}

export async function createStudentProject(input: { title: string; description?: string; tech_stack?: string[]; project_url?: string; status?: Project['status'] }): Promise<Project> {
  const userId = await getAuthenticatedUserId();
  const title = input.title.trim();
  if (!title) throw new Error('Project title is required.');
  const { data, error } = await supabase.from('projects').insert({ user_id: userId, title, description: input.description?.trim() || null, tech_stack: input.tech_stack ?? [], project_url: input.project_url?.trim() || null, status: input.status ?? 'completed' }).select('*').single();
  if (error) throw error;
  return data as Project;
}

export async function createUserCertification(input: { name: string; provider: string; issue_date?: string; credential_url?: string }): Promise<UserCertification> {
  const userId = await getAuthenticatedUserId();
  const name = input.name.trim();
  const provider = input.provider.trim();
  if (!name || !provider) throw new Error('Certification name and provider are required.');
  const { data, error } = await supabase.from('user_certifications').insert({ user_id: userId, name, provider, issue_date: input.issue_date || null, credential_url: input.credential_url?.trim() || null }).select('*').single();
  if (error) throw error;
  return data as UserCertification;
}

export async function getStudentProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getUserCertifications(userId: string): Promise<UserCertification[]> {
  const { data, error } = await supabase.from('user_certifications').select('*').eq('user_id', userId).order('issue_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getStudentApplications(userId: string): Promise<StudentApplication[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*, job:jobs(title, location, mode, skills, company:companies(name)), internship:internships(title, deadline, mode, skills, company:companies(name))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as StudentApplication[];
}

export async function getStudentBookmarks(userId: string) {
  const { data, error } = await supabase.from('bookmarks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getStudentGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase.from('goals').select('*').eq('user_id', userId).order('due_date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getStudentDashboardData(userId: string) {
  const [score, projects, certifications, applications, bookmarks, goals, enrollments, roadmaps, roadmapTemplates, skills, resumeVersions, resumeAnalyses, achievementData, analyticsEvents, mockInterviews, catalogCourses, catalogCertifications, catalogJobs, catalogInternships] = await Promise.all([
    getCareerScore(userId),
    getStudentProjects(userId),
    getUserCertifications(userId),
    getStudentApplications(userId),
    getStudentBookmarks(userId),
    getStudentGoals(userId),
    getEnrollments(userId),
    getStudentRoadmaps(userId),
    getRoadmapTemplates(),
    getStudentSkills(userId),
    getResumeVersions(userId),
    getResumeAnalyses(userId),
    getAchievementData(userId),
    getAnalyticsEvents(userId),
    getMockInterviewSessions(userId),
    getCourses(),
    getCertificationCatalog(),
    getJobs(),
    getInternships(),
  ]);
  return { score, projects, certifications, applications, bookmarks, goals, enrollments, roadmaps, roadmapTemplates, skills, resumeVersions, resumeAnalyses, achievementData, analyticsEvents, mockInterviews, catalogCourses, catalogCertifications, catalogJobs, catalogInternships };
}

export async function getGoals(type?: 'daily' | 'weekly'): Promise<Goal[]> {
  let query = supabase.from('goals').select('*').order('created_at', { ascending: false });
  if (type) query = query.eq('type', type);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function toggleGoal(goalId: string, completed: boolean): Promise<void> {
  const { error } = await supabase.from('goals').update({ completed }).eq('id', goalId);
  if (error) throw error;
}

export async function getNotifications(): Promise<Notification[]> {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(notificationId: string, read = true): Promise<Notification> {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from('notifications')
    .update({ read })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function markAllNotificationsRead(): Promise<void> {
  const userId = await getAuthenticatedUserId();
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw error;
}

// ─── Profile ─────────────────────────────────────────────────────
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export type EditableProfileFields = Pick<Profile, 'full_name' | 'avatar_url' | 'bio' | 'phone' | 'location' | 'website' | 'github_url' | 'linkedin_url' | 'college' | 'degree' | 'graduation_year' | 'company_name'>;

export async function updateProfile(userId: string, changes: Partial<EditableProfileFields>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(changes)
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateUserSettings(userId: string, changes: Partial<Omit<UserSettings, 'id' | 'user_id'>>): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .update(changes)
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getEnrollments(userId: string): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, course:courses(*)')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function getAuthenticatedUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('You must be signed in to continue.');
  return data.user.id;
}

export async function createApplication(target: { jobId?: string; internshipId?: string; coverLetter?: string; resumeUrl?: string }) {
  if ((target.jobId ? 1 : 0) + (target.internshipId ? 1 : 0) !== 1) throw new Error('Choose exactly one job or internship.');
  const userId = await getAuthenticatedUserId();
  const targetColumn = target.jobId ? 'job_id' : 'internship_id';
  const targetId = target.jobId ?? target.internshipId;
  const { data: existingRows, error: existingError } = await supabase
    .from('applications')
    .select('id')
    .eq('user_id', userId)
    .eq(targetColumn, targetId)
    .limit(1);
  if (existingError) throw existingError;
  if (existingRows?.[0]) throw new Error('You have already applied to this opportunity.');

  const { data, error } = await supabase.from('applications').insert({
    user_id: userId,
    job_id: target.jobId ?? null,
    internship_id: target.internshipId ?? null,
    cover_letter: target.coverLetter ?? null,
    resume_url: target.resumeUrl ?? null,
  }).select('*').single();
  if (error) throw error;
  return data;
}

export async function getMyApplications(): Promise<StudentApplication[]> {
  return getStudentApplications(await getAuthenticatedUserId());
}

export async function toggleBookmark(target: { jobId?: string; internshipId?: string; courseId?: string }) {
  if ((target.jobId ? 1 : 0) + (target.internshipId ? 1 : 0) + (target.courseId ? 1 : 0) !== 1) throw new Error('Choose exactly one item to bookmark.');
  const userId = await getAuthenticatedUserId();
  const column = target.jobId ? 'job_id' : target.internshipId ? 'internship_id' : 'course_id';
  const value = target.jobId ?? target.internshipId ?? target.courseId;
  const { data: existingRows, error: lookupError } = await supabase.from('bookmarks').select('id').eq('user_id', userId).eq(column, value).limit(1);
  if (lookupError) throw lookupError;
  const existing = existingRows?.[0];
  if (existing) {
    const { error } = await supabase.from('bookmarks').delete().eq('id', existing.id).eq('user_id', userId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from('bookmarks').insert({ user_id: userId, job_id: target.jobId ?? null, internship_id: target.internshipId ?? null, course_id: target.courseId ?? null });
  if (error) throw error;
  return true;
}

export async function enrollInCourse(courseId: string): Promise<Enrollment> {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase.from('enrollments').upsert({ user_id: userId, course_id: courseId }, { onConflict: 'user_id,course_id' }).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<Enrollment> {
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) throw new Error('Progress must be between 0 and 100.');
  const userId = await getAuthenticatedUserId();
  const completed = progress === 100;
  const { data, error } = await supabase.from('enrollments').update({ progress, completed, completed_at: completed ? new Date().toISOString() : null }).eq('id', enrollmentId).eq('user_id', userId).select('*').single();
  if (error) throw error;
  return data;
}

export interface RoadmapStep {
  step?: string;
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface StudentRoadmap {
  id: string;
  user_id: string;
  career_id: string | null;
  title: string;
  steps: RoadmapStep[];
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface EarnedBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export async function getStudentRoadmaps(userId: string): Promise<StudentRoadmap[]> {
  const { data, error } = await supabase.from('roadmaps').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as StudentRoadmap[];
}

export async function updateStudentRoadmap(roadmapId: string, userId: string, steps: RoadmapStep[], progress: number): Promise<StudentRoadmap> {
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) throw new Error('Roadmap progress must be between 0 and 100.');
  const { data, error } = await supabase.from('roadmaps').update({ steps, progress }).eq('id', roadmapId).eq('user_id', userId).select('*').single();
  if (error) throw error;
  return data as StudentRoadmap;
}

export async function getAchievementData(userId: string) {
  const [badgesResult, earnedResult, goals] = await Promise.all([
    supabase.from('badges').select('*').order('xp_required'),
    supabase.from('user_badges').select('*').eq('user_id', userId),
    getStudentGoals(userId),
  ]);
  if (badgesResult.error) throw badgesResult.error;
  if (earnedResult.error) throw earnedResult.error;
  return { badges: badgesResult.data ?? [], earnedBadges: (earnedResult.data ?? []) as EarnedBadge[], goals };
}

export async function getSiddhiContext(userId: string) {
  // Reuse the dashboard aggregate so SIDDHI does not issue duplicate
  // roadmap, goal, achievement, or analytics requests for the same user.
  const [profile, dashboard] = await Promise.all([
    getProfile(userId),
    getStudentDashboardData(userId),
  ]);
  return {
    profile,
    dashboard,
    roadmaps: dashboard.roadmaps,
    achievementData: dashboard.achievementData,
  };
}


export async function getRoadmapTemplates(): Promise<RoadmapTemplate[]> {
  const { data, error } = await supabase.from('roadmap_templates').select('*').order('created_at');
  if (error) throw error;
  return (data ?? []) as RoadmapTemplate[];
}

export async function createRoadmapFromTemplate(template: RoadmapTemplate): Promise<StudentRoadmap> {
  const userId = await getAuthenticatedUserId();
  const steps = template.steps.map((step) => ({ ...step, completed: false }));
  const { data, error } = await supabase.from('roadmaps').insert({
    user_id: userId,
    career_id: template.career_id,
    title: template.title.replace(/^\[DEV\]\s*/, ''),
    steps,
    progress: 0,
  }).select('*').single();
  if (error) throw error;
  return data as StudentRoadmap;
}

export async function getStudentSkills(userId: string): Promise<StudentSkill[]> {
  const { data, error } = await supabase.from('student_skills').select('*').eq('user_id', userId).order('name');
  if (error) throw error;
  return (data ?? []) as StudentSkill[];
}

export async function upsertStudentSkill(skill: Pick<StudentSkill, 'name' | 'category' | 'proficiency'>): Promise<StudentSkill> {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase.from('student_skills').upsert({ ...skill, user_id: userId }, { onConflict: 'user_id,name' }).select('*').single();
  if (error) throw error;
  return data as StudentSkill;
}

export async function deleteStudentSkill(skillId: string): Promise<void> {
  const userId = await getAuthenticatedUserId();
  const { error } = await supabase.from('student_skills').delete().eq('id', skillId).eq('user_id', userId);
  if (error) throw error;
}

export async function getResumeVersions(userId: string): Promise<ResumeVersion[]> {
  const { data, error } = await supabase.from('resume_versions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ResumeVersion[];
}

export async function getResumeAnalyses(userId: string): Promise<ResumeAnalysis[]> {
  const { data, error } = await supabase.from('resume_analyses').select('*').eq('user_id', userId).order('analyzed_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ResumeAnalysis[];
}

export async function uploadResumeFile(file: File): Promise<ResumeVersion> {
  const userId = await getAuthenticatedUserId();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const allowedExtensions = new Set(['pdf', 'doc', 'docx']);
  const allowedMimeTypes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]);
  if (!allowedExtensions.has(extension) || (file.type && !allowedMimeTypes.has(file.type))) {
    throw new Error('Please choose a PDF, DOC, or DOCX resume.');
  }
  if (file.size > 10 * 1024 * 1024) throw new Error('Resume files must be 10 MB or smaller.');

  // Read the user's existing versions before upload. The new file is uploaded
  // first, so a failed upload never destroys the current resume.
  const previousVersions = await getResumeVersions(userId);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${userId}/${crypto.randomUUID()}-${safeName}`;
  const storage = supabase.storage.from('resume');
  const { error: uploadError } = await storage.upload(storagePath, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (uploadError) throw uploadError;

  let savedVersion: ResumeVersion;
  try {
    // file_url stores the path inside the private `resume` bucket.
    savedVersion = await saveResumeVersion({ title: file.name, content: null, file_url: storagePath });
  } catch (error) {
    // Clean up the object if the database reference could not be saved.
    await storage.remove([storagePath]);
    throw error;
  }

  // Remove prior objects and references only after the new version is current.
  for (const previousVersion of previousVersions) {
    if (previousVersion.file_url) {
      const { error: removeError } = await storage.remove([previousVersion.file_url]);
      if (removeError) throw removeError;
    }
    const { error: deleteError } = await supabase
      .from('resume_versions')
      .delete()
      .eq('id', previousVersion.id)
      .eq('user_id', userId);
    if (deleteError) throw deleteError;
  }

  return savedVersion;
}

export async function removeResumeFile(version: ResumeVersion): Promise<void> {
  const userId = await getAuthenticatedUserId();
  if (version.user_id !== userId) throw new Error('You can only remove your own resume.');
  if (version.file_url) {
    const { error: storageError } = await supabase.storage.from('resume').remove([version.file_url]);
    if (storageError) throw storageError;
  }
  const { error } = await supabase.from('resume_versions').delete().eq('id', version.id).eq('user_id', userId);
  if (error) throw error;
}

export async function saveResumeVersion(input: Pick<ResumeVersion, 'title' | 'content' | 'file_url'>): Promise<ResumeVersion> {
  const title = input.title.trim();
  if (!title) throw new Error('Resume title is required.');

  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from('resume_versions')
    .insert({ ...input, title, user_id: userId, is_current: false })
    .select('*')
    .single();
  if (error) throw error;

  // Keep only one current version for this user. RLS still limits both updates
  // to the authenticated owner, and the inserted row is returned after promotion.
  const { error: clearCurrentError } = await supabase
    .from('resume_versions')
    .update({ is_current: false })
    .eq('user_id', userId)
    .neq('id', data.id);
  if (clearCurrentError) throw clearCurrentError;

  const { data: currentVersion, error: promoteError } = await supabase
    .from('resume_versions')
    .update({ is_current: true })
    .eq('id', data.id)
    .eq('user_id', userId)
    .select('*')
    .single();
  if (promoteError) throw promoteError;
  return currentVersion as ResumeVersion;
}

export async function saveInformationalResumeAnalysis(input: { resumeVersionId: string; atsScore: number; recommendations: unknown[] }): Promise<ResumeAnalysis> {
  if (!Number.isInteger(input.atsScore) || input.atsScore < 0 || input.atsScore > 100) throw new Error('ATS score must be between 0 and 100.');
  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase.from('resume_analyses').insert({ user_id: userId, resume_version_id: input.resumeVersionId, ats_score: input.atsScore, recommendations: input.recommendations, is_trusted: false }).select('*').single();
  if (error) throw error;
  return data as ResumeAnalysis;
}

export async function getMockInterviewSessions(userId: string): Promise<MockInterviewSession[]> {
  const { data, error } = await supabase.from('mock_interview_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as MockInterviewSession[];
}

export async function saveMockInterviewSession(input: { interviewType: string; metadata: Record<string, unknown>; score?: number; feedback?: unknown[]; completed?: boolean }): Promise<MockInterviewSession> {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase.from('mock_interview_sessions').insert({ user_id: userId, interview_type: input.interviewType, metadata: input.metadata, score: input.score ?? null, feedback: input.feedback ?? [], completed: input.completed ?? false, completed_at: input.completed ? new Date().toISOString() : null }).select('*').single();
  if (error) throw error;
  return data as MockInterviewSession;
}

export async function getCertificationCatalog(): Promise<CertificationCatalogItem[]> {
  const { data, error } = await supabase.from('certification_catalog').select('*').order('provider').order('name');
  if (error) throw error;
  return (data ?? []) as CertificationCatalogItem[];
}

// ─── Analytics events ───────────────────────────────────────────
export async function getAnalyticsEvents(userId: string, limit = 100): Promise<AnalyticsEvent[]> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    throw new Error('Analytics event limit must be between 1 and 500.');
  }

  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('user_id', userId)
    .order('occurred_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AnalyticsEvent[];
}

export async function recordAnalyticsEvent(input: {
  eventType: string;
  entityId?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}): Promise<AnalyticsEvent> {
  const eventType = input.eventType.trim();
  if (!eventType) throw new Error('Analytics event type is required.');
  if (input.value !== undefined && !Number.isFinite(input.value)) {
    throw new Error('Analytics event value must be finite.');
  }

  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from('analytics_events')
    .insert({
      user_id: userId,
      event_type: eventType,
      entity_id: input.entityId ?? null,
      value: input.value ?? null,
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as AnalyticsEvent;
}


export async function getSavedCareerIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('saved_careers').select('career_id').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((item) => item.career_id as string);
}

export async function toggleSavedCareer(careerId: string): Promise<boolean> {
  const userId = await getAuthenticatedUserId();
  const { data: existing, error: lookupError } = await supabase.from('saved_careers').select('id').eq('user_id', userId).eq('career_id', careerId).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) {
    const { error } = await supabase.from('saved_careers').delete().eq('id', existing.id).eq('user_id', userId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from('saved_careers').insert({ user_id: userId, career_id: careerId });
  if (error) throw error;
  return true;
}

export interface PrepTest { id: string; title: string; category: string; duration_minutes: number; difficulty: string | null; questions: Array<{ q?: string; question?: string; options?: string[]; opts?: string[]; answer?: number; correct?: number; explanation?: string }>; created_at: string; }

export async function getPrepTests(): Promise<PrepTest[]> {
  const { data, error } = await supabase.from('prep_tests').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PrepTest[];
}

export async function saveTestResult(input: { testId: string; score: number; totalQuestions: number; correctAnswers: number; timeTakenSeconds?: number }) {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase.from('test_results').insert({ user_id: userId, test_id: input.testId, score: input.score, total_questions: input.totalQuestions, correct_answers: input.correctAnswers, time_taken_seconds: input.timeTakenSeconds ?? null }).select('*').single();
  if (error) throw error;
  return data;
}

export async function getGameSessions(userId: string) {
  const { data, error } = await supabase.from('game_sessions').select('*').eq('user_id', userId).order('completed_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
