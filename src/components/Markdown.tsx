import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Markdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-4 list-disc space-y-1.5 pl-6">{children}</ul>,
        ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1.5 pl-6">{children}</ol>,
        h1: ({ children }) => <h1 className="mb-3 mt-5 text-xl font-semibold">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-3 mt-5 text-lg font-semibold">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-2 mt-4 font-semibold">{children}</h3>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer" className="text-[#10a37f] underline">
            {children}
          </a>
        ),
        pre: ({ children }) => (
          <pre className="my-4 overflow-x-auto rounded-xl bg-[#0d0d0d] p-4 text-[13px] leading-6 text-[#ececec] [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[#ececec]">
            {children}
          </pre>
        ),
        code: ({ children }) => (
          <code className="rounded-md bg-[#ececec] px-1.5 py-0.5 font-mono text-[0.875em] dark:bg-[#2f2f2f]">
            {children}
          </code>
        ),
        table: ({ children }) => (
          <div className="my-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-black/10 px-3 py-2 font-semibold dark:border-white/15">{children}</th>
        ),
        td: ({ children }) => (
          <td className="border border-black/10 px-3 py-2 dark:border-white/15">{children}</td>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  )
}