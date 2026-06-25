<template>
  <div class="text-editor">
    <div class="editor-header">
      <h2>{{ isEdit ? '编辑作品' : '新建创作' }}</h2>
      <span class="save-status" :class="saveStatusClass">{{ saveStatusText }}</span>
    </div>

    <form @submit.prevent="manualSave">
      <!-- 标题 -->
      <div class="form-group">
        <label>标题</label>
        <input v-model="form.title" type="text" placeholder="输入作品标题" class="input-title" @input="triggerAutoSave" />
      </div>

      <!-- 内容区 — 核心 -->
      <div class="form-group">
        <label>内容 <span class="required">*</span></label>
        <textarea
          v-model="form.content"
          placeholder="在这里开始创作，内容会自动保存到云端..."
          rows="18"
          class="textarea-content"
          @input="triggerAutoSave"
        ></textarea>
      </div>

      <!-- 工具栏 -->
      <div class="form-row">
        <div class="form-group">
          <label>目标平台</label>
          <select v-model="form.platform" @change="triggerAutoSave">
            <option value="other">通用</option>
            <option value="douyin">抖音</option>
            <option value="xhs">小红书</option>
            <option value="bili">B 站</option>
            <option value="weibo">微博</option>
            <option value="wxgzh">公众号</option>
          </select>
        </div>
        <div class="form-group">
          <label>标签（逗号分隔）</label>
          <input v-model="tagsInput" placeholder="标签1, 标签2, 标签3" @input="triggerAutoSave" />
        </div>
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <div class="form-actions">
        <div class="action-left">
          <button type="button" @click="goToList" class="btn-back">← 返回列表</button>
        </div>
        <div class="action-right">
          <span class="auto-save-hint" v-if="lastSavedAt">上次保存：{{ formatTime(lastSavedAt) }}</span>
          <button type="submit" class="btn-save" :disabled="saving">
            {{ saving ? '保存中...' : '手动保存' }}
          </button>
        </div>
      </div>
    </form>

    <div class="editor-footer">
      <span class="word-count">字数 {{ form.content.length }}</span>
      <span class="line-count" v-if="form.content">行数 {{ form.content.split('\n').length }}</span>
    </div>
  </div>
</template>

<script>
import { getText, createText, updateText } from '../api/index.js'

const AUTOSAVE_DELAY = 3000 // 3 秒无输入后自动保存

export default {
  name: 'TextEditor',
  props: { id: String },
  data() {
    return {
      isEdit: false,
      saving: false,
      error: '',
      form: { title: '未命名作品', content: '', platform: 'other', tags: [] },
      tagsInput: '',
      saveStatus: 'idle',    // idle | saving | saved | unsaved
      lastSavedAt: null,
      autoSaveTimer: null,
      textId: null,          // 创建后记录云端 ID
      hasUnsaved: false
    }
  },
  computed: {
    saveStatusClass() {
      return {
        'status-idle': this.saveStatus === 'idle',
        'status-saving': this.saveStatus === 'saving',
        'status-saved': this.saveStatus === 'saved',
        'status-unsaved': this.saveStatus === 'unsaved'
      }
    },
    saveStatusText() {
      const m = { idle: '', saving: '⏳ 保存中...', saved: '✅ 已保存到云端', unsaved: '💾 未保存' }
      return m[this.saveStatus] || ''
    }
  },
  async mounted() {
    if (this.id) {
      this.isEdit = true
      this.textId = this.id
      try {
        const res = await getText(this.id)
        const d = res.data.data
        this.form = { title: d.title, content: d.content, platform: d.platform, tags: d.tags || [] }
        this.tagsInput = (d.tags || []).join(', ')
        this.lastSavedAt = new Date(d.updatedAt)
        this.saveStatus = 'saved'
      } catch (err) {
        this.error = '加载作品失败'
      }
    }
  },
  beforeUnmount() {
    // 离开页面时，如果有未保存内容，最后一次保存
    if (this.hasUnsaved && this.form.content.trim()) {
      this.autoSave()
    }
    clearTimeout(this.autoSaveTimer)
  },
  methods: {
    // 触发自动保存（带防抖）
    triggerAutoSave() {
      this.hasUnsaved = true
      this.saveStatus = 'unsaved'
      clearTimeout(this.autoSaveTimer)
      this.autoSaveTimer = setTimeout(() => {
        this.autoSave()
      }, AUTOSAVE_DELAY)
    },

    // 自动保存
    async autoSave() {
      if (!this.form.content.trim()) return
      this.saveStatus = 'saving'

      const data = {
        title: this.form.title || '未命名作品',
        content: this.form.content,
        platform: this.form.platform,
        tags: this.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      }

      try {
        if (this.textId) {
          // 已有 ID → 更新
          await updateText(this.textId, data)
        } else {
          // 首次自动保存 → 创建
          const res = await createText(data)
          this.textId = res.data.data._id
          this.isEdit = true
        }
        this.hasUnsaved = false
        this.lastSavedAt = new Date()
        this.saveStatus = 'saved'
      } catch (err) {
        this.saveStatus = 'unsaved'
        console.error('自动保存失败:', err)
      }
    },

    // 手动保存
    async manualSave() {
      if (this.saving) return
      clearTimeout(this.autoSaveTimer)
      this.saving = true
      this.error = ''

      if (!this.form.content.trim()) {
        this.error = '内容不能为空'
        this.saving = false
        return
      }

      const data = {
        title: this.form.title || '未命名作品',
        content: this.form.content,
        platform: this.form.platform,
        tags: this.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      }

      try {
        if (this.textId) {
          await updateText(this.textId, data)
        } else {
          const res = await createText(data)
          this.textId = res.data.data._id
          this.isEdit = true
        }
        this.hasUnsaved = false
        this.lastSavedAt = new Date()
        this.saveStatus = 'saved'
      } catch (err) {
        this.error = err.response?.data?.error || '保存失败'
        this.saveStatus = 'unsaved'
      } finally {
        this.saving = false
      }
    },

    goToList() {
      if (this.hasUnsaved && this.form.content.trim()) {
        this.autoSave()
      }
      this.$router.push('/')
    },

    formatTime(date) {
      const d = new Date(date)
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.text-editor { max-width: 800px; margin: 0 auto; }

/* 顶栏 */
.editor-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
}
.editor-header h2 { margin: 0; }
.save-status { font-size: 13px; padding: 4px 10px; border-radius: 4px; }
.status-saving { background: #fff3cd; color: #856404; }
.status-saved { background: #d4edda; color: #155724; }
.status-unsaved { background: #f8d7da; color: #721c24; }

/* 表单 */
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 14px; margin-bottom: 6px; color: #555; }
.required { color: #e74c3c; }
.input-title {
  width: 100%; padding: 10px 12px; border: 1px solid #ddd;
  border-radius: 6px; font-size: 16px; outline: none;
}
.textarea-content {
  width: 100%; padding: 12px; border: 1px solid #ddd;
  border-radius: 6px; font-size: 15px; line-height: 1.8;
  resize: vertical; font-family: inherit; outline: none;
  transition: border-color 0.2s;
}
.input-title:focus, .textarea-content:focus, select:focus, .form-group input:focus {
  border-color: #1a73e8;
}
.textarea-content:focus {
  box-shadow: 0 0 0 2px rgba(26,115,232,0.1);
}

.form-row { display: flex; gap: 16px; }
.form-row .form-group { flex: 1; }
.form-group select, .form-group input[type="text"] {
  width: 100%; padding: 8px 12px; border: 1px solid #ddd;
  border-radius: 6px; font-size: 14px; background: #fff; outline: none;
}

/* 操作栏 */
.form-actions {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 24px;
}
.action-right { display: flex; align-items: center; gap: 12px; }
.auto-save-hint { font-size: 12px; color: #999; }
.btn-back {
  padding: 8px 16px; border: 1px solid #ddd; border-radius: 6px;
  background: #fff; cursor: pointer; font-size: 14px;
}
.btn-back:hover { background: #f5f5f5; }
.btn-save {
  padding: 10px 24px; background: #1a73e8; color: #fff;
  border: none; border-radius: 6px; cursor: pointer; font-size: 14px;
}
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-save:hover:not(:disabled) { background: #1557b0; }
.error-msg { color: #e74c3c; font-size: 14px; }

/* 底栏 */
.editor-footer {
  display: flex; gap: 16px; justify-content: flex-end;
  margin-top: 8px; font-size: 13px; color: #999;
}
</style>
