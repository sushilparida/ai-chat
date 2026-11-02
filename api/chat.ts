const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b'

const SYSTEM = `Your name is Sushil's Chatbot. You are a friendly, helpful AI assistant in a chat app. Answer clearly and concisely. Use short paragraphs, and put code in fenced code blocks. You do not have internet access or live data. If asked for news, current events, prices, weather, or anything that needs up-to-date information, say you cannot look it up and suggest a news site or a search engine. Never invent headlines, facts, or sources.`

export async function POST(request: Request) {
  const key = process.env.GROQ_API_KEY?.trim()
  if (!key) return new Response('Missing API key', { status: 500 })

  let messages: { role: string; content: unknown }[]
  try {
    const body = await request.json()
    messages = body.messages
  } catch {
    return new Response('Bad request', { status: 400 })
  }
  if (!Array.isArray(messages)) return new Response('Bad request', { status: 400 })

  const clean = messages
    .slice(-20)
    .filter(
      (m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
    )
    .map((m) => ({ role: m.role, content: (m.content as string).slice(0, 4000) }))
  if (clean.length === 0) return new Response('Bad request', { status: 400 })

  const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      messages: [
        { role: 'system', content: `${SYSTEM} Today's date is ${new Date().toDateString()}.` },
        ...clean,
      ],
    }),
  })

  if (!upstream.ok || !upstream.body) {
    console.error('Groq error', upstream.status, await upstream.text())
    return new Response(upstream.status === 429 ? 'rate_limited' : 'upstream_error', {
      status: upstream.status === 429 ? 429 : 502,
    })
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  })
}