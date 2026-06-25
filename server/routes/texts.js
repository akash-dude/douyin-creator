const express = require('express')
const router = express.Router()
const Text = require('../models/Text')
const auth = require('../middleware/auth')

// ─── 获取用户的所有文本（分页） ───
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, platform, search } = req.query
    const query = { userId: req.userId }

    if (status) query.status = status
    if (platform) query.platform = platform
    if (search) {
      query.$text = { $search: search }
    }

    const total = await Text.countDocuments(query)
    const texts = await Text.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean()

    res.json({
      data: texts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (err) {
    res.status(500).json({ error: '获取列表失败', message: err.message })
  }
})

// ─── 获取单篇文本 ───
router.get('/:id', auth, async (req, res) => {
  try {
    const text = await Text.findOne({ _id: req.params.id, userId: req.userId }).lean()
    if (!text) return res.status(404).json({ error: '作品不存在' })
    res.json({ data: text })
  } catch (err) {
    res.status(500).json({ error: '获取失败', message: err.message })
  }
})

// ─── 创建文本（保存到云端） ───
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, summary, tags, platform } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '内容不能为空' })
    }

    const text = new Text({
      userId: req.userId,
      title: title || '未命名作品',
      content,
      summary: summary || content.slice(0, 200),
      tags: tags || [],
      platform: platform || 'other'
    })

    await text.save()
    res.status(201).json({ data: text, message: '保存成功' })
  } catch (err) {
    res.status(500).json({ error: '保存失败', message: err.message })
  }
})

// ─── 更新文本 ───
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, summary, tags, platform, status } = req.body
    const update = {}
    if (title !== undefined) update.title = title
    if (content !== undefined) update.content = content
    if (summary !== undefined) update.summary = summary
    if (tags !== undefined) update.tags = tags
    if (platform !== undefined) update.platform = platform
    if (status !== undefined) update.status = status
    update.$inc = { version: 1 }

    const text = await Text.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      update,
      { new: true, runValidators: true }
    )
    if (!text) return res.status(404).json({ error: '作品不存在' })
    res.json({ data: text, message: '更新成功' })
  } catch (err) {
    res.status(500).json({ error: '更新失败', message: err.message })
  }
})

// ─── 删除文本 ───
router.delete('/:id', auth, async (req, res) => {
  try {
    const text = await Text.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!text) return res.status(404).json({ error: '作品不存在' })
    res.json({ message: '删除成功' })
  } catch (err) {
    res.status(500).json({ error: '删除失败', message: err.message })
  }
})

module.exports = router
