<template>
  <div class="editor-page">

    <!-- 顶部：内容类型选择器 -->
    <div class="type-bar">
      <button
        v-for="t in contentTypes"
        :key="t.value"
        class="type-btn"
        :class="{ active: form.contentType === t.value }"
        @click="switchType(t.value)"
      >
        <span class="type-icon">{{ t.icon }}</span>
        <span class="type-label">{{ t.label }}</span>
        <span class="type-desc">{{ t.desc }}</span>
      </button>
    </div>

    <!-- 表单 -->
    <form @submit.prevent="save" class="editor-form">

      <!-- ─── 标题（通用） ─── -->
      <div class="form-group">
        <label>标题</label>
        <input v-model="form.title" type="text" placeholder="输入作品标题" class="input-title" />
      </div>

      <!-- ═══ 图文模式 ═══ -->
      <template v-if="form.contentType === 'imageText'">
        <div class="form-group">
          <label>图片 <span class="optional">(可选，最多 9 张)</span></label>
          <div class="image-grid">
            <div
              v-for="(img, i) in form.images"
              :key="i"
              class="image-cell"
              @click="removeImage(i)"
            >
              <img :src="img" />
              <span class="remove-icon">&times;</span>
            </div>
            <label v-if="form.images.length < 9" class="image-cell add-image">
              <input type="file" accept="image/*" multiple @change="uploadImages" hidden />
              <span class="add-icon">+</span>
              <span class="add-text">添加图片</span>
            </label>
          </div>
          <p class="hint" v-if="uploading">上传中... {{ uploadProgress }}</p>
        </div>
        <div class="form-group">
          <label>图文正文</label>
          <textarea v-model="form.content" placeholder="写一段文字搭配图片..." rows="12" class="textarea-content"></textarea>
        </div>
      </template>

      <!-- ═══ 文章模式 ═══ -->
      <template v-if="form.contentType === 'article'">
        <div class="form-group">
          <label>摘要</label>
          <input v-model="form.summary" type="text" placeholder="一句话概括文章内容" class="input-title" />
        </div>
        <div class="form-group">
          <label>正文</label>
          <textarea v-model="form.content" placeholder="开始撰写文章..." rows="20" class="textarea-content article-area"></textarea>
        </div>
      </template>

      <!-- ═══ 短视频文案模式 ═══ -->
      <template v-if="form.contentType === 'shortScript'">
        <div class="form-group char-counter">
          <label>文案</label>
          <span class="char-count" :class="{ over: form.content.length > 200 }">
            {{ form.content.length }} / 200
          </span>
        </div>
        <textarea
          v-model="form.content"
          placeholder="输入短视频文案（建议 200 字以内）..."
          rows="8"
          class="textarea-content short-area"
          maxlength="500"
        ></textarea>
        <div class="form-group">
          <label>话题标签</label>
          <div class="hashtag-input">
            <span v-for="(h, i) in form.hashtags" :key="i" class="hashtag-tag">
              #{{ h }}
              <span class="tag-remove" @click="form.hashtags.splice(i, 1)">&times;</span>
            </span>
            <input
              v-model="hashtagInput"
              @keydown.enter.prevent="addHashtag"
              @keydown.,.prevent="addHashtag"
              placeholder="输入标签后按 Enter 或逗号"
              class="hashtag-field"
            />
          </div>
        </div>
      </template>

      <!-- ═══ 通用模式 ═══ -->
      <template v-if="form.contentType === 'general'">
        <div class="form-group">
          <label>正文</label>
          <textarea v-model="form.content" placeholder="在这里开始创作..." rows="15" class="textarea-content"></textarea>
        </div>
      </template>

      <!-- ─── 底部通用配置 ─── -->
      <div class="form-row">
        <div class="form-group">
          <label>目标平台</label>
          <select v-model="form.platform" @change="autoDetectType">
            <optgroup label="图文">
              <option value="xhs">小红书</option>
              <option value="weibo">微博</option>
            </optgroup>
            <optgroup label="文章">
              <option value="wxgzh">公众号</option>
              <option value="csdn">CSDN</option>
              <option value="zh">知乎</option>
              <option value="tt">头条</option>
              <option value="bjh">百家号</option>
            </optgroup>
            <optgroup label="短视频">
              <option value="douyin">抖音</option>
              <option value="kuaishou">快手</option>
              <option value="sph">视频号</option>
            </optgroup>
            <optgroup label="其他">
              <option value="bili">B 站</option>
              <option value="other">通用</option>
            </optgroup>
          </select>
        </div>
        <div class="form-group">
          <label>标签（逗号分隔）</label>
          <input v-model="tagsInput" placeholder="标签1, 标签2" />
        </div>
      </div>

      <!-- ─── 状态提示 ─── -->
      <div v-if="saveMessage" class="save-message" :class="saveMessageType">{{ saveMessage }}</div>
      <p v-if="error" class="error-msg">{{ error }}</p>

      <!-- ─── 操作按钮 ─── -->
      <div class="form-actions">
        <button type="button" @click="$router.push('/')" class="btn-cancel">取消</button>
        <button type="submit" class="btn-save" :disabled="saving || uploading">
          {{ saving ? '保存中...' : (isEdit ? '更新' : '发布到云端') }}
        </button>
      </div>
    </form>

    <div class="editor-footer">
      字数：{{ form.content.length }}
      <template v-if="form.contentType === 'imageText'">｜图片：{{ form.images.length }} 张</template>
    </div>
  </div>
</template>

<script>
import { getText, createText, updateText } from '../api/index.js'
import api from '../api/index.js'

const CONTENT_TYPES = [
  { value: 'general',    icon: '📝', label: '通用',   desc: '简洁文本' },
  { value: 'imageText',  icon: '🖼️', label: '图文',   desc: '图片 + 文字' },
  { value: 'article',    icon: '📰', label: '文章',   desc: '长文 / 专栏' },
  { value: 'shortScript',icon: '🎬', label: '短视频', desc: '文案 / 脚本' }
]

// 平台 → 内容类型映射
const PLATFORM_TYPE_MAP = {
  xhs: 'imageText', weibo: 'imageText',
  wxgzh: 'article', csdn: 'article', zh: 'article', tt: 'article', bjh: 'article',
  douyin: 'shortScript', kuaishou: 'shortScript', sph: 'shortScript'
}

export default {
  name: 'TextEditor',
  props: { id: String },
  data() {
    return {
      contentTypes: CONTENT_TYPES,
      isEdit: false,
      saving: false,
      uploading: false,
      uploadProgress: '',
      error: '',
      saveMessage: '',
      saveMessageType: '',
      hashtagInput: '',
      tagsInput: '',
      form: {
        contentType: 'general',
        title: '',
        content: '',
        summary: '',
        images: [],
        hashtags: [],
        tags: [],
        platform: 'other'
      }
    }
  },
  async mounted() {
    if (this.id) {
      this.isEdit = true
      try {
        const res = await getText(this.id)
        const d = res.data.data
        this.form = {
          contentType: d.contentType || 'general',
          title: d.title || '',
          content: d.content || '',
          summary: d.summary || '',
          images: d.images || [],
          hashtags: d.hashtags || [],
          tags: d.tags || [],
          platform: d.platform || 'other'
        }
        this.tagsInput = (d.tags || []).join(', ')
      } catch (err) {
        this.error = '加载作品失败'
      }
    }
  },
  methods: {
    // 切换内容类型
    switchType(type) {
      if (this.form.contentType === type) return
      this.form.contentType = type
      // 类型切换时清理不相关的字段
      if (type !== 'imageText') this.form.images = []
      if (type !== 'shortScript') this.form.hashtags = []
      if (type !== 'article') this.form.summary = ''
    },

    // 选择平台时自动推断内容类型
    autoDetectType() {
      const t = PLATFORM_TYPE_MAP[this.form.platform]
      if (t && t !== this.form.contentType && !this.isEdit) {
        this.switchType(t)
      }
    },

    // 上传图片（图文模式）
    async uploadImages(e) {
      const files = Array.from(e.target.files)
      if (this.form.images.length + files.length > 9) {
        this.error = '最多 9 张图片'
        return
      }
      this.uploading = true
      this.error = ''
      const formData = new FormData()
      files.forEach(f => formData.append('images', f))
      this.uploadProgress = `0 / ${files.length}`
      try {
        const res = await api.post('/upload/batch', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        const urls = res.data.data.map(u => u.url)
        this.form.images.push(...urls)
      } catch (err) {
        this.error = '图片上传失败'
      } finally {
        this.uploading = false
        this.uploadProgress = ''
        e.target.value = ''
      }
    },

    removeImage(idx) {
      this.form.images.splice(idx, 1)
    },

    // 添加话题标签
    addHashtag() {
      const tag = this.hashtagInput.replace(/^#/, '').trim()
      if (tag && !this.form.hashtags.includes(tag)) {
        this.form.hashtags.push(tag)
      }
      this.hashtagInput = ''
    },

    // 保存
    async save() {
      if (this.saving || this.uploading) return
      if (!this.form.content.trim() && this.form.contentType !== 'imageText') {
        this.error = '内容不能为空'
        return
      }
      // 图文模式允许只有图片没有文字
      if (this.form.contentType === 'imageText' && !this.form.content.trim() && this.form.images.length === 0) {
        this.error = '请添加文字或图片'
        return
      }

      this.error = ''
      this.saving = true
      this.saveMessage = ''

      const data = {
        contentType: this.form.contentType,
        title: this.form.title || '未命名作品',
        content: this.form.content,
        summary: this.form.summary || this.form.content.slice(0, 200),
        images: this.form.images,
        hashtags: this.form.hashtags,
        tags: this.tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        platform: this.form.platform
      }

      try {
        if (this.isEdit) {
          await updateText(this.id, data)
          this.saveMessage = '✅ 已更新'
          this.saveMessageType = 'success'
        } else {
          const res = await createText(data)
          this.saveMessage = '✅ 已发布到云端'
          this.saveMessageType = 'success'
          this.isEdit = true
          this.$router.replace(`/edit/${res.data.data._id}`)
        }
      } catch (err) {
        this.error = err.response?.data?.error || '保存失败'
        this.saveMessage = '❌ 保存失败'
        this.saveMessageType = 'error'
      } finally {
        this.saving = false
        if (this.saveMessageType === 'success') {
          setTimeout(() => { this.saveMessage = '' }, 3000)
        }
      }
    }
  }
}
</script>

<style scoped>
/* ─── 顶栏：类型选择 ─── */
.type-bar {
  display: flex; gap: 8px; margin-bottom: 24px;
  background: #fff; border-radius: 10px; padding: 8px;
  border: 1px solid #e8e8e8;
}
.type-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  gap: 2px; padding: 10px 8px; border: none; border-radius: 8px;
  background: transparent; cursor: pointer; transition: all 0.2s;
}
.type-btn:hover { background: #f5f7fa; }
.type-btn.active { background: #e8f0fe; box-shadow: 0 0 0 1px #1a73e8; }
.type-icon { font-size: 20px; }
.type-label { font-size: 13px; font-weight: 600; color: #333; }
.type-desc { font-size: 11px; color: #999; }
.type-btn.active .type-label { color: #1a73e8; }

/* ─── 编辑器表单 ─── */
.editor-page { max-width: 860px; margin: 0 auto; }
.editor-form { background: #fff; border-radius: 10px; padding: 24px; border: 1px solid #e8e8e8; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 14px; margin-bottom: 6px; color: #555; font-weight: 500; }
.optional { font-weight: 400; color: #999; font-size: 13px; }
.input-title { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; outline: none; }
.textarea-content { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 15px; line-height: 1.8; resize: vertical; font-family: inherit; outline: none; }
.input-title:focus, .textarea-content:focus, select:focus, input:focus { border-color: #1a73e8; }
.article-area { min-height: 400px; }
.short-area { font-size: 18px; line-height: 1.6; }

/* ─── 图片网格 ─── */
.image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.image-cell {
  aspect-ratio: 1; border-radius: 8px; overflow: hidden;
  border: 1px solid #e8e8e8; position: relative; cursor: pointer;
}
.image-cell img { width: 100%; height: 100%; object-fit: cover; }
.remove-icon {
  position: absolute; top: 4px; right: 4px; width: 22px; height: 22px;
  background: rgba(0,0,0,0.5); color: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 14px;
  opacity: 0; transition: opacity 0.2s;
}
.image-cell:hover .remove-icon { opacity: 1; }
.add-image {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; background: #fafafa; cursor: pointer;
  border: 2px dashed #ddd; transition: border-color 0.2s;
}
.add-image:hover { border-color: #1a73e8; }
.add-icon { font-size: 32px; color: #999; line-height: 1; }
.add-text { font-size: 12px; color: #999; margin-top: 4px; }
.hint { font-size: 13px; color: #1a73e8; margin-top: 4px; }

/* ─── 话题标签 ─── */
.char-counter { display: flex; justify-content: space-between; align-items: center; }
.char-count { font-size: 13px; color: #999; }
.char-count.over { color: #e74c3c; font-weight: 600; }
.hashtag-input { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px; border: 1px solid #ddd; border-radius: 6px; min-height: 42px; }
.hashtag-input:focus-within { border-color: #1a73e8; }
.hashtag-tag {
  display: inline-flex; align-items: center; gap: 4px;
  background: #e8f0fe; color: #1a73e8; padding: 2px 8px; border-radius: 12px; font-size: 13px;
}
.tag-remove { cursor: pointer; font-size: 14px; font-weight: 600; }
.hashtag-field { border: none; outline: none; flex: 1; min-width: 80px; font-size: 14px; }

/* ─── 底部 ─── */
.form-row { display: flex; gap: 16px; }
.form-row .form-group { flex: 1; }
.form-group select, .form-group input[type="text"] { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; background: #fff; outline: none; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
.btn-cancel { padding: 10px 24px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px; }
.btn-save { padding: 10px 24px; background: #1a73e8; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.save-message { text-align: center; font-size: 14px; padding: 8px; border-radius: 6px; margin-bottom: 4px; }
.save-message.success { background: #d4edda; color: #155724; }
.save-message.error { background: #f8d7da; color: #721c24; }
.error-msg { color: #e74c3c; font-size: 14px; text-align: center; }
.editor-footer { text-align: right; font-size: 13px; color: #999; margin-top: 8px; }
</style>
