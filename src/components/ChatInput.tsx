import { useRef, useState } from 'react'

interface Props {
  onSend: (text: string) => void
  onStop: () => void
  busy: boolean
}

export default function ChatInput({ onSend, onStop, busy }: Props) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  function submit() {
    const value = text.trim()
    if (!value || busy) return
    onSend(value)
    setText('')
    if (ref.current) ref.current.style.height = 'auto'
  }

  return (
    <div className="px-4 pb-3">
      <div className="flex items-end gap-2 rounded-3xl bg-[#f4f4f4] px-4 py-2 dark:bg-[#2f2f2f]">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          rows={1}
          placeholder="Message Sushil's Chatbot"
          className="max-h-40 flex-1 resize-none bg-transparent py-2 text-[15px] text-[#0d0d0d] outline-none placeholder:text-slate-500 dark:text-[#ececec] dark:placeholder:text-slate-400"
        />
        {busy ? (
          <button
            onClick={onStop}
            aria-label="Stop"
            className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-xs text-white dark:bg-white dark:text-black"
          >
            ■
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!text.trim()}
            aria-label="Send"
            className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-lg text-white disabled:opacity-30 dark:bg-white dark:text-black"
          >
            ↑
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
        AI can make mistakes. Check important information.
      </p>
    </div>
  )
}