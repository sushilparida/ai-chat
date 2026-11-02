import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function apiDev(env: Record<string, string>): Plugin {
  return {
    name: 'api-dev',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        Object.assign(process.env, env)
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        try {
          const mod = await server.ssrLoadModule('/api/chat.ts')
          const request = new Request('http://localhost/api/chat', {
            method: req.method,
            headers: { 'content-type': 'application/json' },
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
          })
          const response: Response = await mod.POST(request)
          res.statusCode = response.status
          response.headers.forEach((value, name) => res.setHeader(name, value))
          if (response.body) {
            const reader = response.body.getReader()
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              res.write(value)
            }
          }
          res.end()
        } catch (e) {
          console.error(e)
          res.statusCode = 500
          res.end('Server error')
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return { plugins: [react(), tailwindcss(), apiDev(env)] }
})