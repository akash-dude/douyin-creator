<template>
  <div class="text-detail">
    <div class="detail-header">
      <button @click="$router.push('/')" class="btn-back">← 返回列表</button>
      <div class="detail-actions" v-if="text">
        <router-link :to="`/edit/${text._id}`" class="btn-edit">编辑</router-link>
        <button @click="handleDelete" class="btn-delete">删除</button>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <template v-else-if="text">
      <div class="detail-card">

        <!-- 类型 + 标题 -->
        <div class="detail-top">
          <span class="type-badge" :class="text.contentType">{{ typeLabel }}</span>
          <h1 class="detail-title">{{ text.title }}</h1>
        </div>

        <!-- 元信息 -->
        <div class="detail-meta">
          <span>{{ formatDate(text.createdAt) }}</span>
          <span class="status" :class="text.status">{{ statusLabel }}</span>
          <span v-if="text.platform !== 'other'" class="platform">{{ platformLabel }}</span>
          <span>{{ text.content.length }} 字</span>
          <span v-if="text.version > 1">v{{ text.version }}</span>
        </div>

        <!-- 标签 -->
        <div class="detail-tags" v-if="text.tags?.length">
          <span v-for="tag in text.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <!-- ═══ 图文：图片墙 ═══ -->
        <div v-if="text.contentType === 'imageText' && text.images?.length" class="image-gallery">
          <img v-for="(img, i) in text.images" :key="i" :src="img" @click="previewIndex = i" />
        </div>

        <!-- ═══ 文章：摘要 ═══ -->
        <div v-if="text.contentType === 'article' && text.summary" class="summary-block">
          {{ text.summary }}
        </div>

        <!-- ═══ 短视频：话题标签 ═══ -->
        <div v-if="text.contentType === 'shortScript' && text.hashtags?.length" class="hashtag-bar">
          <span v-for="h in text.hashtags" :key="h" class="hashtag">#{{ h }}</span>
        </div>

        <!-- ═══ 正文 ═══ -->
        <div class="detail-body">{{ text.content }}</div>
      </div>

      <!-- 图片预览（灯箱） -->
      <div v-if="previewIndex !== null" class="lightbox" @click="previewIndex = null">
        <img :src="text.images[previewIndex]" />
        <div class="lightbox-nav">
          <button v-if="previewIndex > 0" @click.stop="previewIndex--">‹</button>
          <span>{{ previewIndex + 1 }} / {{ text.images.length }}</span>
          <button v-if="previewIndex < text.images.length - 1" @click.stop="previewIndex++">›</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { getText, deleteText } from '../api/index.js'

const TYPE_MAP = { general: '通用', imageText: '图文', article: '文章', shortScript: '短视频' }
const PLATFORM_MAP = {
  douyin: '抖音', kuaishou: '快手', bili: 'B站', xhs: '小红书',
  weibo: '微博', wxgzh: '公众号', zh: '知乎', csdn: 'CSDN',
  bjh: '百家号', tt: '头条', sph: '视频号', other: '通用'
}

export default {
  name: 'TextDetail',
  data() {
    return { text: null, loading: true, previewIndex: null }
  },
  computed: {
    typeLabel() { return TYPE_MAP[this.text?.contentType] || '通用' },
    platformLabel() { return PLATFORM_MAP[this.text?.platform] || this.text?.platform },
    statusLabel() {
      return { draft: '草稿', published: '已发布', archived: '已归档' }[this.text?.status] || ''
    }
  },
  async mounted() {
    try {
      const res = await getText(this.$route.params.id)
      this.text = res.data.data
    } catch (err) {
      alert('加载失败')
      this.$router.push('/')
    } finally {
      this.loading = false
    }
  },
  methods: {
    async handleDelete() {
      if (!confirm('确定删除这篇作品？')) return
      try {
        await deleteText(this.$route.params.id)
        this.$router.push('/')
      } catch (err) {
        alert('删除失败')
      }
    },
    formatDate(date) { return new Date(date).toLocaleDateString('zh-CN') }
  }
}
</script>

<style scoped>
.detail-header { display: flex; justify-content: space-between; margin-bottom: 16px; }
.btn-back { padding: 8px 16px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px; }
.detail-actions { display: flex; gap: 8px; }
.btn-edit { padding: 8px 16px; background: #1a73e8; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px; }
.btn-delete { padding: 8px 16px; background: #fff; color: #e74c3c; border: 1px solid #e74c3c; border-radius: 6px; cursor: pointer; font-size: 14px; }
.loading { text-align: center; padding: 60px; color: #999; }

.detail-card { background: #fff; border-radius: 10px; padding: 32px; border: 1px solid #e8e8e8; }
.detail-top { margin-bottom: 12px; }
.type-badge {
  display: inline-block; font-size: 12px; padding: 2px 8px; border-radius: 4px;
  margin-bottom: 8px; font-weight: 500;
}
.type-badge.general { background: #e8e8e8; color: #666; }
.type-badge.imageText { background: #fce4ec; color: #c62828; }
.type-badge.article { background: #e3f2fd; color: #1565c0; }
.type-badge.shortScript { background: #fff3e0; color: #e65100; }
.detail-title { font-size: 22px; margin: 0; }

.detail-meta { display: flex; gap: 16px; font-size: 13px; color: #999; margin-bottom: 10px; flex-wrap: wrap; }
.status { padding: 1px 6px; border-radius: 3px; }
.status.draft { background: #fff3cd; color: #856404; }
.status.published { background: #d4edda; color: #155724; }
.platform { background: #f0f0f0; color: #666; padding: 1px 6px; border-radius: 3px; }

.detail-tags { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.tag { background: #e8f0fe; color: #1a73e8; padding: 2px 8px; border-radius: 4px; font-size: 12px; }

/* 图片墙 */
.image-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; margin-bottom: 20px; }
.image-gallery img {
  width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 6px;
  cursor: pointer; transition: transform 0.15s;
}
.image-gallery img:hover { transform: scale(1.02); }

/* 摘要 */
.summary-block {
  background: #f8f9fa; padding: 12px 16px; border-radius: 6px;
  font-size: 14px; color: #666; margin-bottom: 16px; border-left: 3px solid #1a73e8;
}

/* 话题标签 */
.hashtag-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.hashtag { color: #1a73e8; font-size: 14px; font-weight: 500; }

/* 正文 */
.detail-body { white-space: pre-wrap; line-height: 1.8; font-size: 15px; color: #333; }

/* 灯箱 */
.lightbox {
  position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.lightbox img { max-width: 90vw; max-height: 85vh; border-radius: 4px; }
.lightbox-nav {
  position: absolute; bottom: 40px; display: flex; align-items: center;
  gap: 20px; color: #fff; font-size: 14px;
}
.lightbox-nav button {
  padding: 6px 16px; background: rgba(255,255,255,0.15); color: #fff;
  border: none; border-radius: 4px; cursor: pointer; font-size: 20px;
}
.lightbox-nav button:hover { background: rgba(255,255,255,0.3); }
</style>
