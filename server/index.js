import express from 'express'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import './db.js'
import authRoutes from './routes/auth.js'
import cardsRoutes from './routes/cards.js'
import txnRoutes from './routes/transactions.js'
import approvalsRoutes from './routes/approvals.js'
import employeesRoutes from './routes/employees.js'
import adminRoutes from './routes/admin.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = Number(process.env.PORT) || 3001
const isProd = process.env.NODE_ENV === 'production'

app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/cards', cardsRoutes)
app.use('/api/transactions', txnRoutes)
app.use('/api/approvals', approvalsRoutes)
app.use('/api/employees', employeesRoutes)
app.use('/api/admin', adminRoutes)

if (isProd) {
  const distDir = resolve(__dirname, '..', 'dist')
  app.use(express.static(distDir))
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(resolve(distDir, 'index.html'))
  })
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[server error]', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] listening on :${PORT} (${isProd ? 'prod' : 'dev'})`)
})
