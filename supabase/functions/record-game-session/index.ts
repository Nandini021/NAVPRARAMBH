import { withSupabase } from 'npm:@supabase/server'

type Payload = {
  attemptId?: unknown
  answers?: unknown
}

function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 })
}

/*
  Compatibility endpoint.

  The previous API accepted client-provided correctAnswers and
  totalQuestions. That protocol is intentionally rejected because those
  values cannot be trusted. New clients must use submit-game-attempt.
*/
export default {
  fetch: withSupabase({ auth: 'user' }, async (request, context) => {
    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 })
    }

    let payload: Payload
    try {
      payload = await request.json() as Payload
    } catch {
      return badRequest('Request body must be valid JSON')
    }

    if ('correctAnswers' in payload || 'totalQuestions' in payload || 'score' in payload) {
      return badRequest('The count-based game submission protocol is no longer supported')
    }
    if (typeof payload.attemptId !== 'string' || !Array.isArray(payload.answers)) {
      return badRequest('Use attemptId and answers from submit-game-attempt')
    }

    const { data, error } = await context.supabase.rpc('finalize_game_attempt', {
      p_attempt_id: payload.attemptId,
      p_answers: payload.answers,
    })

    if (error) {
      console.error('Compatibility game submission failed', error)
      return Response.json({ error: error.message }, { status: 400 })
    }
    return Response.json(data)
  }),
}
