import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from './cors'

export interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  PORTAL_URL: string
}

interface Credentials {
  email?: string
  password?: string
}

interface SessionTokens {
  access_token?: string
  refresh_token?: string
}

function json(data: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  })
}

async function handleSignup(request: Request, env: Env, origin: string | null): Promise<Response> {
  const { email, password } = (await request.json()) as Credentials
  if (!email || !password) {
    return json({ error: 'email、passwordは必須です' }, 400, origin)
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: env.PORTAL_URL },
  })
  if (error) {
    return json({ error: error.message }, 400, origin)
  }
  return json({ user: data.user, session: data.session }, 200, origin)
}

async function handleLogin(request: Request, env: Env, origin: string | null): Promise<Response> {
  const { email, password } = (await request.json()) as Credentials
  if (!email || !password) {
    return json({ error: 'email、passwordは必須です' }, 400, origin)
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return json({ error: error.message }, 401, origin)
  }
  return json({ user: data.user, session: data.session }, 200, origin)
}

async function handleLogout(request: Request, env: Env, origin: string | null): Promise<Response> {
  const { access_token, refresh_token } = (await request.json()) as SessionTokens
  if (!access_token || !refresh_token) {
    return json({ error: 'access_token、refresh_tokenは必須です' }, 400, origin)
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  await supabase.auth.setSession({ access_token, refresh_token })
  const { error } = await supabase.auth.signOut()
  if (error) {
    return json({ error: error.message }, 400, origin)
  }
  return json({ ok: true }, 200, origin)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin')

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) })
    }

    const url = new URL(request.url)

    try {
      if (request.method === 'POST' && url.pathname === '/auth/signup') {
        return await handleSignup(request, env, origin)
      }
      if (request.method === 'POST' && url.pathname === '/auth/login') {
        return await handleLogin(request, env, origin)
      }
      if (request.method === 'POST' && url.pathname === '/auth/logout') {
        return await handleLogout(request, env, origin)
      }
      return json({ error: 'Not Found' }, 404, origin)
    } catch {
      return json({ error: 'リクエストの形式が不正です' }, 400, origin)
    }
  },
} satisfies ExportedHandler<Env>
