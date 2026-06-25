const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Text = require('../models/Text')

// ─── 获取列表（分页 + 筛选 + 搜索） ───
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, contentType, platform, search } = req.query
    const query = { userId: req.userId }

    if (status) query.status = status
    if (contentType) query.contentType = contentType
    if (platform) query.platform = platform
    if (search) query.$text = { $search: search }

    const total = await Text.countDocuments(query)
    const texts = await Text.find(query)
      .select('-sections') // 列表不返回文章分节
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean()

    res.json({
      data: texts,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
    })
  } catch (err) {
    res.status(500).json({ error: '获取列表失败', message: err.message })
  }
})

// ─── 获取单篇 ───
router.get('/:id', auth, async (req, res) => {
  try {
    const text = await Text.findOne({ _id: req.params.id, userId: req.userId }).lean()
    if (!text) return res.status(404).json({ error: '作品不存在' })
    res.json({ data: text })
  } catch (err) {
    res.status(500).json({ error: '获取失败', message: err.message })
  }
})

// ─── 创建 ───
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, contentType, summary, images, sections, hashtags, tags, platform } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '内容不能为空' })
    }

    const text = new Text({
      userId: req.userId,
      title: title || '未命名作品',
      content,
      contentType: contentType || 'general',
      summary: summary || content.slice(0, 200),
      images: images || [],
      sections: sections || [],
      hashtags: hashtags || [],
      tags: tags || [],
      platform: platform || 'other'
    })

    await text.save()
    res.status(201).json({ data: text, message: '保存成功' })
  } catch (err) {
    res.status(500).json({ error: '保存失败', message: err.message })
  }
})

// ─── 更新 ───
router.put('/:id', auth, async (req, res) => {
  try {
    const allowed = ['title', 'content', 'contentType', 'summary', 'images', 'sections', 'hashtags', 'tags', 'platform', 'status']
    const update = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key]
    }
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

// ─── 删除 ───
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
