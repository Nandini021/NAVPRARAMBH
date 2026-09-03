import { withSupabase } from 'npm:@supabase/server'

type Payload = { gameId?: unknown; difficulty?: unknown }

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

    if (typeof payload.gameId !== 'string' || payload.gameId.length === 0) {
      return badRequest('gameId is required')
    }
    if (payload.difficulty !== undefined && payload.difficulty !== null && typeof payload.difficulty !== 'string') {
      return badRequest('difficulty must be a string')
    }

    const { data, error } = await context.supabase.rpc('start_game_attempt', {
      p_game_id: payload.gameId,
      p_difficulty: payload.difficulty ?? null,
    })

    if (error) {
      console.error('Game attempt start failed', error)
      return Response.json({ error: error.message }, { status: 400 })
    }
    return Response.json(data)
  }),
}
