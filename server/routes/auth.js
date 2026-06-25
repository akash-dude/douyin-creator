const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

// ─── 注册 ───
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少 6 位' })
    }

    const existing = await User.findOne({ username })
    if (existing) {
      return res.status(409).json({ error: '用户名已存在' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = new User({
      username,
      password: hashedPassword,
      nickname: nickname || username
    })
    await user.save()

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: user._id, username, nickname: user.nickname } })
  } catch (err) {
    res.status(500).json({ error: '注册失败', message: err.message })
  }
})

// ─── 登录 ───
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, username, nickname: user.nickname } })
  } catch (err) {
    res.status(500).json({ error: '登录失败', message: err.message })
  }
})

module.exports = router
