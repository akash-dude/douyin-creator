import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import routes from './routes.js'

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：未登录跳转到登录页
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.name !== 'Login' && !token) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

createApp(App).use(router).mount('#app')
