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
    <div v-else-if="text" class="detail-content">
      <h1 class="detail-title">{{ text.title }}</h1>
      <div class="detail-meta">
        <span>{{ formatDate(text.createdAt) }}</span>
        <span class="status" :class="text.status">{{ statusLabel(text.status) }}</span>
        <span v-if="text.platform !== 'other'" class="platform">{{ text.platform }}</span>
        <span>v{{ text.version }}</span>
        <span>{{ text.content.length }} 字</span>
      </div>
      <div class="detail-tags" v-if="text.tags?.length">
        <span v-for="tag in text.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <div class="detail-body">{{ text.content }}</div>
    </div>
  </div>
</template>

<script>
import { getText, deleteText } from '../api/index.js'

export default {
  name: 'TextDetail',
  data() {
    return { text: null, loading: true }
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
    formatDate(date) { return new Date(date).toLocaleDateString('zh-CN') },
    statusLabel(s) { return { draft: '草稿', published: '已发布', archived: '已归档' }[s] || s }
  }
}
</script>

<style scoped>
.detail-header { display: flex; justify-content: space-between; margin-bottom: 24px; }
.btn-back { padding: 8px 16px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px; }
.detail-actions { display: flex; gap: 8px; }
.btn-edit { padding: 8px 16px; background: #1a73e8; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px; }
.btn-delete { padding: 8px 16px; background: #fff; color: #e74c3c; border: 1px solid #e74c3c; border-radius: 6px; cursor: pointer; font-size: 14px; }
.loading { text-align: center; padding: 60px; color: #999; }
.detail-content { background: #fff; border-radius: 8px; padding: 32px; border: 1px solid #e8e8e8; }
.detail-title { font-size: 24px; margin-bottom: 12px; }
.detail-meta { display: flex; gap: 16px; font-size: 13px; color: #999; margin-bottom: 12px; }
.status { padding: 1px 6px; border-radius: 3px; }
.status.draft { background: #fff3cd; color: #856404; }
.status.published { background: #d4edda; color: #155724; }
.detail-tags { display: flex; gap: 8px; margin-bottom: 20px; }
.tag { background: #e8f0fe; color: #1a73e8; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.platform { background: #f0f0f0; color: #666; padding: 1px 6px; border-radius: 3px; }
.detail-body { white-space: pre-wrap; line-height: 1.8; font-size: 15px; color: #333; }
</style>
