const mongoose = require('mongoose')

const textSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // 内容类型
  contentType: {
    type: String,
    enum: ['imageText', 'article', 'shortScript', 'general'],
    default: 'general'
  },

  // 标题 / 作品名
  title: {
    type: String,
    default: '未命名作品'
  },

  // 正文
  content: {
    type: String,
    required: [true, '内容不能为空']
  },

  // 摘要（文章类专用）
  summary: {
    type: String,
    default: ''
  },

  // 图片（图文类专用）
  images: [{
    type: String   // 图片 URL 或路径
  }],

  // 文章分节（文章类专用）
  sections: [{
    heading: { type: String },
    body: { type: String }
  }],

  // 话题标签（短视频类）
  hashtags: [{
    type: String,
    trim: true
  }],

  // 通用标签
  tags: [{
    type: String,
    trim: true
  }],

  // 目标发布平台
  platform: {
    type: String,
    enum: ['douyin', 'kuaishou', 'bili', 'xhs', 'weibo', 'wxgzh', 'zh', 'csdn', 'bjh', 'tt', 'sph', 'other'],
    default: 'other'
  },

  // 状态
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },

  // 版本
  version: {
    type: Number,
    default: 1
  }

}, {
  timestamps: true
})

textSchema.index({ title: 'text', content: 'text', tags: 'text' })

module.exports = mongoose.model('Text', textSchema)
