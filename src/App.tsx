import { useEffect, useMemo, useRef, useState } from 'react'
import type { Conversation, Message } from './types'
import { streamReply } from './lib/chatApi'
import MessageBubble from './components/MessageBubble'
import ChatInput from './components/ChatInput'
import ChatSidebar from './components/ChatSidebar'

const STORAGE_KEY = 'ai-chat-conversations'
const SUGGESTIONS = [
  'Explain React hooks in simple words',
  'Give me interview tips for freshers',
  'What is the difference between SQL and NoSQL?',
]

function loadChats(): Conversation[] {
  try {
    localStorage.removeItem('ai-chat-messages')
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as Conversation[]) : []
  } catch {
    return []
  }
}

export default function App() {
  const [chats, setChats] = useState<Conversation[]>(loadChats)
  const [activeId, setActiveId] = useState(() => crypto.randomUUID())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const activeChat = chats.find((c) => c.id === activeId)
  const messages: Message[] = activeChat?.messages ?? []

  const sortedChats = useMemo(
    () => [...chats].sort((a, b) => b.updatedAt - a.updatedAt),
    [chats]
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
    } catch {
      // ignore storage errors
    }
  }, [chats])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages])

  async function handleSend(text: string) {
    setError(null)
    const chatId = activeId
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    const botMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' }
    const history = [...messages, userMsg]

    setChats((prev) => {
      const existing = prev.find((c) => c.id === chatId)
      const updated: Conversation = {
        id: chatId,
        title: existing?.title ?? text.slice(0, 40),
        messages: [...history, botMsg],
        updatedAt: Date.now(),
      }
      return existing ? prev.map((c) => (c.id === chatId ? updated : c)) : [updated, ...prev]
    })
    setBusy(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      await streamReply(
        history,
        (token) => {
          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === botMsg.id ? { ...m, content: m.content + token } : m
                    ),
                  }
                : c
            )
          )
        },
        controller.signal
      )
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setError(
          err instanceof Error && err.message === 'rate_limited'
            ? 'Too many requests right now. Please wait a minute and try again.'
            : 'Something went wrong. Please try again.'
        )
      }
    } finally {
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.filter((m) => m.role === 'user' || m.content !== ''),
              }
            : c
        )
      )
      setBusy(false)
      abortRef.current = null
    }
  }

  function handleStop() {
    abortRef.current?.abort()
  }

  function handleNewChat() {
    abortRef.current?.abort()
    setActiveId(crypto.randomUUID())
    setError(null)
    setMenuOpen(false)
  }

  function handleSelect(id: string) {
    abortRef.current?.abort()
    setActiveId(id)
    setError(null)
    setMenuOpen(false)
  }

  function handleDelete(id: string) {
    if (id === activeId) {
      abortRef.current?.abort()
      setActiveId(crypto.randomUUID())
      setError(null)
    }
    setChats((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="flex h-dvh bg-white dark:bg-[#212121]">
      <ChatSidebar
        chats={sortedChats}
        activeId={activeId}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSelect={handleSelect}
        onNew={handleNewChat}
        onDelete={handleDelete}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="rounded-lg px-2 py-1 text-xl text-[#0d0d0d] hover:bg-[#f4f4f4] md:hidden dark:text-[#ececec] dark:hover:bg-[#2f2f2f]"
            >
              ☰
            </button>
            <h1 className="text-lg font-medium text-[#0d0d0d] dark:text-[#ececec]">Sushil's Chatbot</h1>
          </div>
          <button
            onClick={() => setDark(!dark)}
            className="rounded-full px-3 py-1.5 text-sm text-[#0d0d0d] hover:bg-[#f4f4f4] dark:text-[#ececec] dark:hover:bg-[#2f2f2f]"
          >
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.length === 0 && (
              <div className="mt-24 text-center">
                <h2 className="text-3xl font-medium text-[#0d0d0d] dark:text-[#ececec]">
                  What can I help with?
                </h2>
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="rounded-2xl border border-black/10 px-4 py-2 text-sm text-[#0d0d0d] hover:bg-[#f4f4f4] dark:border-white/15 dark:text-[#ececec] dark:hover:bg-[#2f2f2f]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {error && <p className="text-center text-sm text-red-600">{error}</p>}
            <div ref={bottomRef} />
          </div>
        </main>

        <div className="mx-auto w-full max-w-3xl">
          <ChatInput onSend={handleSend} onStop={handleStop} busy={busy} />
        </div>
      </div>
    </div>
  )
}