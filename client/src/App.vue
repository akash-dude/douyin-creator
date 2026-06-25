<template>
  <div class="app">
    <nav v-if="isLoggedIn" class="navbar">
      <div class="nav-brand">🦞 创作助手</div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">我的作品</router-link>
        <router-link to="/create" class="nav-link">新建创作</router-link>
      </div>
      <div class="nav-user">
        <span class="username">{{ nickname }}</span>
        <button @click="logout" class="btn-logout">退出</button>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isLoggedIn: false,
      nickname: ''
    }
  },
  mounted() {
    this.checkAuth()
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        this.isLoggedIn = true
        this.nickname = localStorage.getItem('nickname') || ''
      }
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('nickname')
      this.isLoggedIn = false
      this.$router.push('/login')
    }
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333; }
.app { min-height: 100vh; }
.navbar {
  display: flex; align-items: center; padding: 0 24px;
  height: 56px; background: #fff; border-bottom: 1px solid #e8e8e8;
  position: sticky; top: 0; z-index: 100; gap: 24px;
}
.nav-brand { font-size: 18px; font-weight: 700; color: #1a73e8; }
.nav-links { display: flex; gap: 16px; flex: 1; }
.nav-link { text-decoration: none; color: #555; font-size: 14px; }
.nav-link:hover { color: #1a73e8; }
.nav-link.router-link-active { color: #1a73e8; font-weight: 600; }
.nav-user { display: flex; align-items: center; gap: 12px; }
.username { font-size: 14px; color: #666; }
.btn-logout {
  padding: 4px 12px; border: 1px solid #ddd; border-radius: 4px;
  background: #fff; cursor: pointer; font-size: 13px; color: #999;
}
.btn-logout:hover { color: #e74c3c; border-color: #e74c3c; }
.main-content { max-width: 960px; margin: 0 auto; padding: 24px; }
</style>
