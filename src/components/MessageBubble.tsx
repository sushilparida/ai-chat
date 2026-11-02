import type { Message } from '../types'
import Markdown from './Markdown'

export default function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-3xl bg-[#f4f4f4] px-5 py-2.5 text-[15px] leading-7 text-[#0d0d0d] sm:max-w-[70%] dark:bg-[#2f2f2f] dark:text-[#ececec]">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="break-words text-[15px] leading-7 text-[#0d0d0d] dark:text-[#ececec]">
      {message.content ? (
        <Markdown text={message.content} />
      ) : (
        <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-[#0d0d0d] dark:bg-[#ececec]" />
      )}
    </div>
  )
}