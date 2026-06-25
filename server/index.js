require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// ── 中间件 ──
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── 静态文件：上传目录 ──
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── 数据库连接 ──
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/douyin_creator'
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB 已连接'))
  .catch(err => console.error('❌ MongoDB 连接失败:', err.message))

// ── 路由 ──
app.use('/api/texts', require('./routes/texts'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/upload', require('./routes/upload'))

// ── 健康检查 ──
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── 全局错误处理 ──
app.use((err, req, res, next) => {
  console.error(err.stack)
  const msg = err.message?.includes('仅支持') ? err.message : '服务器内部错误'
  res.status(err.status || 500).json({ error: msg })
})

app.listen(PORT, () => {
  console.log(`🚀 服务已启动: http://localhost:${PORT}`)
})
