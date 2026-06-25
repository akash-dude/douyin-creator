const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Text = require('../models/Text')
const auth = require('../middleware/auth')

// 获取用户信息
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password').lean()
    if (!user) return res.status(404).json({ error: '用户不存在' })

    const textCount = await Text.countDocuments({ userId: req.userId })
    res.json({ data: { ...user, textCount } })
  } catch (err) {
    res.status(500).json({ error: '获取用户信息失败', message: err.message })
  }
})

module.exports = router
