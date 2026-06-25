require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
const PORT = process.env.PORT || 3000

// ── 中间件 ──
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── 数据库连接 ──
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/douyin_creator'
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB 已连接'))
  .catch(err => console.error('❌ MongoDB 连接失败:', err.message))

// ── 路由 ──
app.use('/api/texts', require('./routes/texts'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))

// ── 健康检查 ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── 全局错误处理 ──
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: '服务器内部错误', message: err.message })
})

app.listen(PORT, () => {
  console.log(`🚀 服务已启动: http://localhost:${PORT}`)
})
