import type { Message } from '../types'

export async function streamReply(
  messages: Message[],
  onToken: (token: string) => void,
  signal?: AbortSignal
) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
    signal,
  })

  if (!res.ok || !res.body) {
    throw new Error(res.status === 429 ? 'rate_limited' : 'request_failed')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') return
      try {
        const token = JSON.parse(data).choices?.[0]?.delta?.content
        if (token) onToken(token)
      } catch {
        // ignore partial lines
      }
    }
  }
}