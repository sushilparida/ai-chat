import type { Conversation } from '../types'

interface Props {
  chats: Conversation[]
  activeId: string
  open: boolean
  onClose: () => void
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

export default function ChatSidebar({
  chats,
  activeId,
  open,
  onClose,
  onSelect,
  onNew,
  onDelete,
}: Props) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-[#f9f9f9] p-2 text-[#0d0d0d] transition-transform md:static md:translate-x-0 dark:bg-[#171717] dark:text-[#ececec] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={onNew}
          className="mb-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-[#ececec] dark:hover:bg-[#212121]"
        >
          ✏️ New chat
        </button>
        <p className="mb-1 px-3 text-xs font-medium text-slate-500 dark:text-slate-400">Chats</p>
        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {chats.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No chats yet</p>
          )}
          {chats.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center rounded-xl ${
                c.id === activeId
                  ? 'bg-[#ececec] dark:bg-[#2f2f2f]'
                  : 'hover:bg-[#ececec] dark:hover:bg-[#212121]'
              }`}
            >
              <button
                onClick={() => onSelect(c.id)}
                className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm"
              >
                {c.title}
              </button>
              <button
                onClick={() => onDelete(c.id)}
                aria-label="Delete chat"
                className="px-3 text-slate-400 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}