export type ChatTurn = {
  role: 'user' | 'assistant'
  text: string
}

export type ChatPayload = {
  message?: unknown
  conversation?: unknown
}

export type ActionId =
  | 'jobs' | 'internships' | 'courses' | 'careers' | 'roadmap'
  | 'resume' | 'interview' | 'quizzes' | 'games' | 'certifications'

export type ChatResponse = {
  text: string
  provider: 'gemini' | 'local-fallback'
  actions: Array<{ id: ActionId; label: string }>
}
