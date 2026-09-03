import { getAction, SIDDHI_ACTIONS } from './actionRegistry';
import { GeminiProvider } from './providers/geminiProvider';
import type { SiddhiMessage, SiddhiRequest, SiddhiResponse } from './types';

const provider = new GeminiProvider();
const LOCAL_FALLBACK = "SIDDHI is temporarily unavailable. You can still explore your career tools below.";

function localResponse(message: string): SiddhiResponse {
  const lower = message.toLowerCase();
  const ids = Object.keys(SIDDHI_ACTIONS).filter((id) => lower.includes(id)) as Array<keyof typeof SIDDHI_ACTIONS>;
  return {
    text: LOCAL_FALLBACK,
    provider: 'local-fallback',
    actions: ids.slice(0, 2).map(getAction),
  };
}

export async function askSiddhi(message: string, conversation: SiddhiMessage[] = []): Promise<SiddhiResponse> {
  const trimmed = message.trim();
  if (!trimmed) throw new Error('Please enter a message for SIDDHI.');
  const request: SiddhiRequest = {
    message: trimmed.slice(0, 4000),
    conversation: conversation.slice(-12),
  };
  try {
    return await provider.generate(request);
  } catch {
    return localResponse(trimmed);
  }
}

export type { SiddhiAction, SiddhiMessage, SiddhiResponse } from './types';
