import { withSupabase } from 'npm:@supabase/server'

type SubmittedAnswer = { questionId?: unknown; selectedAnswer?: unknown }
type Payload = { attemptId?: unknown; answers?: unknown }

function badRequest(message: string): Response {
  return Response.json({ error: message }, { status: 400 })
}

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

    if (typeof payload.attemptId !== 'string' || payload.attemptId.length === 0) {
      return badRequest('attemptId is required')
    }
    if (!Array.isArray(payload.answers)) return badRequest('answers must be an array')

    const answers = payload.answers as SubmittedAnswer[]
    if (answers.some((answer) => typeof answer.questionId !== 'string' || answer.selectedAnswer === undefined)) {
      return badRequest('Each answer requires questionId and selectedAnswer')
    }

    const { data, error } = await context.supabase.rpc('finalize_game_attempt', {
      p_attempt_id: payload.attemptId,
      p_answers: answers,
    })

    if (error) {
      console.error('Game attempt submission failed', error)
      return Response.json({ error: error.message }, { status: 400 })
    }
    return Response.json(data)
  }),
}
