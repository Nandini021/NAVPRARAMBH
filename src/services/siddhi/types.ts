export type SiddhiRole = 'user' | 'assistant';

export interface SiddhiMessage {
  role: SiddhiRole;
  text: string;
}

export type SiddhiActionId =
  | 'jobs'
  | 'internships'
  | 'courses'
  | 'careers'
  | 'roadmap'
  | 'resume'
  | 'interview'
  | 'quizzes'
  | 'games'
  | 'certifications';

export interface SiddhiAction {
  id: SiddhiActionId;
  label: string;
}

export interface SiddhiResponse {
  text: string;
  provider: 'gemini' | 'local-fallback';
  actions: SiddhiAction[];
}

export interface SiddhiRequest {
  message: string;
  conversation?: SiddhiMessage[];
}

export interface AIProvider {
  generate(request: SiddhiRequest): Promise<SiddhiResponse>;
}
