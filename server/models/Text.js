const mongoose = require('mongoose')

const textSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: '未命名作品'
  },
  content: {
    type: String,
    required: [true, '内容不能为空']
  },
  summary: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  platform: {
    type: String,
    enum: ['douyin', 'kuaishou', 'bili', 'xhs', 'weibo', 'wxgzh', 'zh', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true  // 自动添加 createdAt 和 updatedAt
})

// 添加文本索引支持搜索
textSchema.index({ title: 'text', content: 'text', tags: 'text' })

module.exports = mongoose.model('Text', textSchema)
