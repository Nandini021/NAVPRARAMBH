import { supabase } from '../../../lib/supabase';
import type { AIProvider, SiddhiRequest, SiddhiResponse } from '../types';

export class GeminiProvider implements AIProvider {
  async generate(request: SiddhiRequest): Promise<SiddhiResponse> {
    const { data, error } = await supabase.functions.invoke('siddhi-chat', {
      body: request,
    });

    if (error) throw error;
    if (!data || typeof data.text !== 'string') {
      throw new Error('SIDDHI did not receive a valid provider response.');
    }

    return {
      text: data.text,
      provider: data.provider === 'gemini' ? 'gemini' : 'local-fallback',
      actions: Array.isArray(data.actions) ? data.actions : [],
    };
  }
}
