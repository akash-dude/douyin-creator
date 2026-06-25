<template>
  <div class="text-list">
    <div class="list-header">
      <h2>我的作品 ({{ total }})</h2>
      <router-link to="/create" class="btn-create">+ 新建创作</router-link>
    </div>

    <!-- 筛选栏 -->
    <div class="filters">
      <select v-model="filter.contentType" @change="fetchTexts">
        <option value="">全部类型</option>
        <option value="general">通用</option>
        <option value="imageText">图文</option>
        <option value="article">文章</option>
        <option value="shortScript">短视频</option>
      </select>
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
        <option value="csdn">CSDN</option>
      </select>
      <input v-model="filter.search" @input="debounceSearch" placeholder="搜索标题/内容..." class="search-input" />
    </div>

    <!-- 列表 -->
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="texts.length === 0" class="empty">
      <div class="empty-icon">📝</div>
      <p>还没有作品</p>
      <router-link to="/create" class="btn-empty">开始创作</router-link>
    </div>
    <div v-else class="text-cards">
      <div
        v-for="text in texts"
        :key="text._id"
        class="text-card"
        :class="text.contentType"
        @click="$router.push(`/text/${text._id}`)"
      >
        <!-- 左侧：缩略图（图文类） -->
        <div v-if="text.contentType === 'imageText' && text.images?.length" class="card-thumb">
          <img :src="text.images[0]" />
          <span class="thumb-count" v-if="text.images.length > 1">+{{ text.images.length - 1 }}</span>
        </div>

        <!-- 右侧：内容 -->
        <div class="card-body">
          <div class="card-top">
            <div class="card-title-row">
              <span class="type-badge" :class="text.contentType">{{ typeLabel(text.contentType) }}</span>
              <h3 class="card-title">{{ text.title }}</h3>
            </div>
            <span class="card-status" :class="text.status">{{ statusLabel(text.status) }}</span>
          </div>
          <p class="card-summary">{{ text.summary || text.content.slice(0, 120) }}</p>
          <div class="card-meta">
            <span>{{ formatDate(text.updatedAt) }}</span>
            <span v-if="text.platform !== 'other'" class="platform-tag">{{ platformLabel(text.platform) }}</span>
            <span>{{ text.content.length }} 字</span>
            <span v-if="text.version > 1">v{{ text.version }}</span>
          </div>
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
import { getTexts } from '../api/index.js'

const TYPE_LABELS = {
  general: '通用', imageText: '图文', article: '文章', shortScript: '短视频'
}
const PLATFORM_LABELS = {
  douyin: '抖音', kuaishou: '快手', bili: 'B站', xhs: '小红书',
  weibo: '微博', wxgzh: '公众号', zh: '知乎', csdn: 'CSDN',
  bjh: '百家号', tt: '头条', sph: '视频号', other: '通用'
}

export default {
  name: 'TextList',
  data() {
    return {
      texts: [],
      total: 0,
      page: 1,
      totalPages: 0,
      loading: false,
      filter: { contentType: '', status: '', platform: '', search: '' },
      searchTimer: null
    }
  },
  mounted() { this.fetchTexts() },
  methods: {
    async fetchTexts() {
      this.loading = true
      try {
        const params = { page: this.page, limit: 20 }
        if (this.filter.contentType) params.contentType = this.filter.contentType
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
      this.searchTimer = setTimeout(() => { this.page = 1; this.fetchTexts() }, 400)
    },
    formatDate(date) { return new Date(date).toLocaleDateString('zh-CN') },
    typeLabel(s) { return TYPE_LABELS[s] || s },
    platformLabel(s) { return PLATFORM_LABELS[s] || s },
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
  border-radius: 6px; font-size: 14px; font-weight: 500;
}
.btn-create:hover { background: #1557b0; }

/* 筛选 */
.filters { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.filters select, .search-input {
  padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; background: #fff;
}
.search-input { flex: 1; min-width: 180px; }

/* 空状态 */
.loading, .empty { text-align: center; padding: 60px 0; color: #999; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.btn-empty {
  display: inline-block; margin-top: 12px; padding: 8px 24px;
  background: #1a73e8; color: #fff; text-decoration: none; border-radius: 6px;
}

/* 卡片列表 */
.text-cards { display: grid; gap: 12px; }
.text-card {
  display: flex; gap: 16px; background: #fff; border-radius: 8px;
  padding: 16px; border: 1px solid #e8e8e8; cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.text-card:hover { box-shadow: 0 2px 10px rgba(0,0,0,0.06); border-color: #ccc; }

/* 缩略图 */
.card-thumb {
  width: 80px; min-height: 80px; border-radius: 6px; overflow: hidden;
  position: relative; flex-shrink: 0; background: #f5f5f5;
}
.card-thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb-count {
  position: absolute; bottom: 4px; right: 4px;
  background: rgba(0,0,0,0.5); color: #fff; font-size: 11px;
  padding: 1px 5px; border-radius: 3px;
}

/* 卡片内容 */
.card-body { flex: 1; min-width: 0; }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
.card-title-row { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
.card-title { font-size: 15px; font-weight: 600; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.type-badge {
  flex-shrink: 0; font-size: 11px; padding: 2px 6px; border-radius: 4px;
  font-weight: 500;
}
.type-badge.general { background: #e8e8e8; color: #666; }
.type-badge.imageText { background: #fce4ec; color: #c62828; }
.type-badge.article { background: #e3f2fd; color: #1565c0; }
.type-badge.shortScript { background: #fff3e0; color: #e65100; }
.card-status { flex-shrink: 0; padding: 1px 6px; border-radius: 3px; font-size: 11px; }
.card-status.draft { background: #fff3cd; color: #856404; }
.card-status.published { background: #d4edda; color: #155724; }
.card-summary { font-size: 13px; color: #888; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-meta { font-size: 12px; color: #aaa; display: flex; gap: 12px; flex-wrap: wrap; }
.platform-tag { background: #f0f4ff; color: #1a73e8; padding: 1px 6px; border-radius: 3px; }

/* 分页 */
.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 24px; }
.pagination button {
  padding: 6px 16px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer;
}
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
