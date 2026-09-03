/* The Supabase Edge Function client is intentionally runtime-provided. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { withSupabase } from 'npm:@supabase/server'
import type { ActionId, ChatPayload, ChatResponse, ChatTurn } from './types.ts'

const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.7-flash'
const MAX_HISTORY = 12
const ACTIONS: Record<ActionId, string> = {
  jobs: 'Open Jobs', internships: 'Open Internships', courses: 'Open Courses',
  careers: 'Open Career Explorer', roadmap: 'Open Roadmap', resume: 'Open Resume',
  interview: 'Start Mock Interview', quizzes: 'Open Quizzes', games: 'Open Games',
  certifications: 'View Certifications',
}

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } }) }
function fallback(): ChatResponse { return { text: "I'm SIDDHI, your NAVPRARAMBH career companion. Gemini is temporarily unavailable, but I can still guide you through the available career features.", provider: 'local-fallback', actions: [] } }

async function loadContext(client: any, userId: string) {
  const [profile, skills, enrollments, roadmaps, goals, applications, resumes, interviews, badges] = await Promise.all([
    client.from('profiles').select('full_name,degree,college,location,role').eq('id', userId).maybeSingle(),
    client.from('student_skills').select('name,proficiency,category').eq('user_id', userId).limit(50),
    client.from('enrollments').select('progress,completed,course:courses(title,category,skills)').eq('user_id', userId).limit(30),
    client.from('roadmaps').select('title,progress,steps').eq('user_id', userId).order('updated_at', { ascending: false }).limit(5),
    client.from('goals').select('title,type,completed,due_date').eq('user_id', userId).limit(30),
    client.from('applications').select('status,job:jobs(title,location,skills),internship:internships(title,skills)').eq('user_id', userId).limit(30),
    client.from('resume_versions').select('title,content,is_current,created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
    client.from('mock_interview_sessions').select('interview_type,score,feedback,started_at').eq('user_id', userId).order('started_at', { ascending: false }).limit(5),
    client.from('user_badges').select('badge_id,earned_at').eq('user_id', userId).limit(50),
  ])
  return { profile: profile.data, skills: skills.data ?? [], enrollments: enrollments.data ?? [], roadmaps: roadmaps.data ?? [], goals: goals.data ?? [], applications: applications.data ?? [], resumes: (resumes.data ?? []).map((r: any) => ({ ...r, content: r.content?.slice(0, 3000) })), interviews: interviews.data ?? [], badges: badges.data ?? [] }
}

function parseActions(text: string) {
  const match = text.match(/\[SIDDHI_ACTIONS:\s*([^\]]+)\]/i)
  const ids = match ? match[1].split(',').map((id) => id.trim().toLowerCase()).filter((id): id is ActionId => id in ACTIONS) : []
  return { text: text.replace(/\s*\[SIDDHI_ACTIONS:[^\]]+\]/i, '').trim(), actions: [...new Set(ids)].slice(0, 3).map((id) => ({ id, label: ACTIONS[id] })) }
}

async function generate(client: any, message: string, conversation: ChatTurn[], context: unknown): Promise<ChatResponse> {
  const key = Deno.env.get('GEMINI_API_KEY')
  if (!key) return fallback()
  const system = `You are SIDDHI AI, NAVPRARAMBH's career companion powered by Google Gemini. SIDDHI is the product and personality layer; Gemini is the underlying reasoning model. Be warm, practical, concise, and never claim to be a separately trained foundation model. Use only facts in STUDENT_CONTEXT. Never invent missing progress, scores, courses, jobs, or credentials. Resume and interview feedback is informational and structured, not a hiring decision. You may append at most three safe actions in exactly this format: [SIDDHI_ACTIONS: jobs, courses]. Valid action IDs: ${Object.keys(ACTIONS).join(', ')}. STUDENT_CONTEXT: ${JSON.stringify(context)}`
  const input = [...conversation.slice(-MAX_HISTORY), { role: 'user', text: message }].map((turn) => `${turn.role}: ${turn.text}`).join('\n')
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify({ model: MODEL, system_instruction: system, input, generation_config: { thinking_level: 'low', temperature: 0.7 } }), signal: AbortSignal.timeout(25000) })
  if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`)
  const data = await response.json()
  const text = typeof data.output_text === 'string' ? data.output_text : data.steps?.flatMap((step: any) => step.content ?? []).find((item: any) => typeof item.text === 'string')?.text
  if (!text) throw new Error('Gemini returned no text')
  const parsed = parseActions(text)
  return { text: parsed.text, provider: 'gemini', actions: parsed.actions }
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (request, context) => {
    if (request.method === 'OPTIONS') return new Response('ok', { headers })
    if (request.method !== 'POST') return json({ error: { code: 'method_not_allowed', message: 'Method not allowed' } }, 405)

    let payload: ChatPayload
    try { payload = await request.json() as ChatPayload } catch { return json({ error: { code: 'invalid_json', message: 'Request body must be valid JSON' } }, 400) }
    if (typeof payload.message !== 'string' || !payload.message.trim()) return json({ error: { code: 'invalid_message', message: 'A message is required' } }, 400)
    if (payload.message.length > 4000) return json({ error: { code: 'message_too_long', message: 'Message is too long' } }, 400)

    const { data: authData, error: authError } = await context.supabase.auth.getUser()
    if (authError || !authData.user) return json({ error: { code: 'unauthenticated', message: 'Please sign in to use connected SIDDHI.' } }, 401)
    const conversation = Array.isArray(payload.conversation) ? payload.conversation.filter((turn): turn is ChatTurn => Boolean(turn && typeof turn === 'object' && ((turn as ChatTurn).role === 'user' || (turn as ChatTurn).role === 'assistant') && typeof (turn as ChatTurn).text === 'string')).slice(-MAX_HISTORY) : []

    try {
      const contextData = await loadContext(context.supabase, authData.user.id)
      return json(await generate(context.supabase, payload.message, conversation, contextData))
    } catch (error) {
      console.error('SIDDHI provider failure', error instanceof Error ? error.message : 'unknown error')
      return json(fallback(), 200)
    }
  }),
}
