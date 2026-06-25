<template>
  <div class="text-editor">
    <h2>{{ isEdit ? '编辑作品' : '新建创作' }}</h2>

    <form @submit.prevent="save">
      <div class="form-group">
        <label>标题</label>
        <input v-model="form.title" type="text" placeholder="输入作品标题" class="input-title" />
      </div>

      <div class="form-group">
        <label>内容 <span class="required">*</span></label>
        <textarea
          v-model="form.content"
          placeholder="在这里开始创作..."
          rows="18"
          class="textarea-content"
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>目标平台</label>
          <select v-model="form.platform">
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
          <input v-model="tagsInput" placeholder="标签1, 标签2" />
        </div>
      </div>

      <div v-if="saveMessage" class="save-message" :class="saveMessageType">
        {{ saveMessage }}
      </div>
      <p v-if="error" class="error-msg">{{ error }}</p>

      <div class="form-actions">
        <button type="button" @click="$router.push('/')" class="btn-cancel">取消</button>
        <button type="submit" class="btn-save" :disabled="saving">
          {{ saving ? '保存中...' : (isEdit ? '更新' : '保存到云端') }}
        </button>
      </div>
    </form>

    <div class="editor-footer">
      字数：{{ form.content.length }}
    </div>
  </div>
</template>

<script>
import { getText, createText, updateText } from '../api/index.js'

export default {
  name: 'TextEditor',
  props: { id: String },
  data() {
    return {
      isEdit: false,
      saving: false,
      error: '',
      saveMessage: '',
      saveMessageType: '',
      form: { title: '', content: '', platform: 'other', tags: [] },
      tagsInput: ''
    }
  },
  async mounted() {
    if (this.id) {
      this.isEdit = true
      try {
        const res = await getText(this.id)
        const d = res.data.data
        this.form = { title: d.title, content: d.content, platform: d.platform, tags: d.tags || [] }
        this.tagsInput = (d.tags || []).join(', ')
      } catch (err) {
        this.error = '加载作品失败'
      }
    }
  },
  methods: {
    async save() {
      if (this.saving) return
      if (!this.form.content.trim()) {
        this.error = '内容不能为空'
        return
      }
      this.error = ''
      this.saving = true
      this.saveMessage = ''

      const data = {
        title: this.form.title || '未命名作品',
        content: this.form.content,
        platform: this.form.platform,
        tags: this.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      }

      try {
        if (this.isEdit) {
          await updateText(this.id, data)
          this.saveMessage = '✅ 已更新，保存到云端成功'
          this.saveMessageType = 'success'
        } else {
          const res = await createText(data)
          this.saveMessage = '✅ 已保存到云端'
          this.saveMessageType = 'success'
          // 创建成功后改为编辑模式，下次点就是更新
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
.text-editor { max-width: 800px; margin: 0 auto; }
.text-editor h2 { margin-bottom: 20px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 14px; margin-bottom: 6px; color: #555; }
.required { color: #e74c3c; }
.input-title { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; }
.textarea-content { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 15px; line-height: 1.8; resize: vertical; font-family: inherit; }
.input-title:focus, .textarea-content:focus, select:focus, .form-group input:focus { border-color: #1a73e8; outline: none; }
.form-row { display: flex; gap: 16px; }
.form-row .form-group { flex: 1; }
.form-group select, .form-group input[type="text"] { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; background: #fff; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
.btn-cancel { padding: 10px 24px; border: 1px solid #ddd; border-radius: 6px; background: #fff; cursor: pointer; font-size: 14px; }
.btn-save { padding: 10px 24px; background: #1a73e8; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.save-message { text-align: center; font-size: 14px; padding: 8px; border-radius: 6px; margin-bottom: 4px; }
.save-message.success { background: #d4edda; color: #155724; }
.save-message.error { background: #f8d7da; color: #721c24; }
.error-msg { color: #e74c3c; font-size: 14px; text-align: center; }
.editor-footer { text-align: right; font-size: 13px; color: #999; margin-top: 8px; }
</style>
