<template>
  <div class="text-list">
    <div class="list-header">
      <h2>我的作品 ({{ total }})</h2>
      <router-link to="/create" class="btn-create">+ 新建创作</router-link>
    </div>

    <!-- 筛选 -->
    <div class="filters">
      <select v-model="filter.status" @change="fetchTexts">
        <option value="">全部状态</option>
        <option value="draft">草稿</option>
        <option value="published">已发布</option>
        <option value="archived">已归档</option>
      </select>
      <select v-model="filter.platform" @change="fetchTexts">
        <option value="">全部平台</option>
        <option value="douyin">抖音</option>
        <option value="xhs">小红书</option>
        <option value="bili">B 站</option>
        <option value="weibo">微博</option>
        <option value="wxgzh">公众号</option>
      </select>
      <input v-model="filter.search" @input="debounceSearch" placeholder="搜索标题/内容..." class="search-input" />
    </div>

    <!-- 列表 -->
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="texts.length === 0" class="empty">
      <p>还没有作品，开始你的第一篇创作吧 🚀</p>
    </div>
    <div v-else class="text-cards">
      <div v-for="text in texts" :key="text._id" class="text-card" @click="$router.push(`/text/${text._id}`)">
        <div class="card-top">
          <h3 class="card-title">{{ text.title }}</h3>
          <span class="card-status" :class="text.status">{{ statusLabel(text.status) }}</span>
        </div>
        <p class="card-summary">{{ text.summary }}</p>
        <div class="card-meta">
          <span>{{ formatDate(text.updatedAt) }}</span>
          <span class="platform-tag" v-if="text.platform !== 'other'">{{ text.platform }}</span>
          <span>v{{ text.version }}</span>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="page--; fetchTexts()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; fetchTexts()">下一页</button>
    </div>
  </div>
</template>

<script>
import { getTexts, deleteText } from '../api/index.js'

export default {
  name: 'TextList',
  data() {
    return {
      texts: [],
      total: 0,
      page: 1,
      totalPages: 0,
      loading: false,
      filter: { status: '', platform: '', search: '' },
      searchTimer: null
    }
  },
  mounted() {
    this.fetchTexts()
  },
  methods: {
    async fetchTexts() {
      this.loading = true
      try {
        const params = { page: this.page, limit: 20 }
        if (this.filter.status) params.status = this.filter.status
        if (this.filter.platform) params.platform = this.filter.platform
        if (this.filter.search) params.search = this.filter.search

        const res = await getTexts(params)
        this.texts = res.data.data
        this.total = res.data.pagination.total
        this.totalPages = res.data.pagination.totalPages
      } catch (err) {
        console.error('获取列表失败', err)
      } finally {
        this.loading = false
      }
    },
    debounceSearch() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.page = 1
        this.fetchTexts()
      }, 400)
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN')
    },
    statusLabel(s) {
      return { draft: '草稿', published: '已发布', archived: '已归档' }[s] || s
    }
  }
}
</script>

<style scoped>
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-create {
  padding: 10px 20px; background: #1a73e8; color: #fff; text-decoration: none;
  border-radius: 6px; font-size: 14px;
}
.btn-create:hover { background: #1557b0; }
.filters { display: flex; gap: 12px; margin-bottom: 20px; }
.filters select, .search-input {
  padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; background: #fff;
}
.search-input { flex: 1; }
.loading, .empty { text-align: center; padding: 60px 0; color: #999; }
.text-cards { display: grid; gap: 16px; }
.text-card {
  background: #fff; border-radius: 8px; padding: 16px 20px;
  border: 1px solid #e8e8e8; cursor: pointer; transition: box-shadow 0.2s;
}
.text-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.card-title { font-size: 16px; font-weight: 600; }
.card-status { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.card-status.draft { background: #fff3cd; color: #856404; }
.card-status.published { background: #d4edda; color: #155724; }
.card-status.archived { background: #e2e3e5; color: #383d41; }
.card-summary { font-size: 14px; color: #666; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-meta { font-size: 12px; color: #999; display: flex; gap: 16px; }
.platform-tag { background: #e8f0fe; color: #1a73e8; padding: 1px 6px; border-radius: 3px; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 24px; }
.pagination button {
  padding: 6px 16px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer;
}
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
