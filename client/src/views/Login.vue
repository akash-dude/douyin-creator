<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="login-title">{{ isRegister ? '注册' : '登录' }}</h2>
      <p class="login-subtitle">抖音创作辅助工具</p>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="form.username" type="text" placeholder="输入用户名" required />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="输入密码" required />
        </div>
        <div class="form-group" v-if="isRegister">
          <label>昵称（可选）</label>
          <input v-model="form.nickname" type="text" placeholder="显示名称" />
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '处理中...' : (isRegister ? '注册' : '登录') }}
        </button>
      </form>

      <p class="switch-mode">
        {{ isRegister ? '已有账号？' : '没有账号？' }}
        <a href="#" @click.prevent="isRegister = !isRegister">
          {{ isRegister ? '去登录' : '去注册' }}
        </a>
      </p>
    </div>
  </div>
</template>

<script>
import { login, register } from '../api/index.js'

export default {
  name: 'Login',
  data() {
    return {
      isRegister: false,
      loading: false,
      error: '',
      form: { username: '', password: '', nickname: '' }
    }
  },
  methods: {
    async handleSubmit() {
      this.error = ''
      this.loading = true
      try {
        let res
        if (this.isRegister) {
          res = await register(this.form.username, this.form.password, this.form.nickname)
        } else {
          res = await login(this.form.username, this.form.password)
        }
        const { token, user } = res.data
        localStorage.setItem('token', token)
        localStorage.setItem('nickname', user.nickname || user.username)
        this.$router.push('/')
      } catch (err) {
        this.error = err.response?.data?.error || '操作失败，请稍后重试'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  background: #fff; border-radius: 12px; padding: 40px;
  width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}
.login-title { font-size: 24px; text-align: center; margin-bottom: 4px; }
.login-subtitle { text-align: center; color: #999; font-size: 14px; margin-bottom: 24px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 14px; margin-bottom: 6px; color: #555; }
.form-group input {
  width: 100%; padding: 10px 12px; border: 1px solid #ddd;
  border-radius: 6px; font-size: 14px; outline: none;
}
.form-group input:focus { border-color: #667eea; }
.btn-primary {
  width: 100%; padding: 12px; background: #667eea; color: #fff;
  border: none; border-radius: 6px; font-size: 16px; cursor: pointer; margin-top: 8px;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary:hover:not(:disabled) { background: #5a6fd6; }
.error-msg { color: #e74c3c; font-size: 14px; text-align: center; }
.switch-mode { text-align: center; margin-top: 16px; font-size: 14px; color: #999; }
.switch-mode a { color: #667eea; text-decoration: none; }
</style>
