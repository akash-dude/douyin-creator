import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// 自动注入 Token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 拦截 401 跳转登录
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('nickname')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ───
export const login = (username, password) => api.post('/auth/login', { username, password })
export const register = (username, password, nickname) => api.post('/auth/register', { username, password, nickname })
export const getUserInfo = () => api.get('/users/me')

// ─── 文本 CRUD ───
export const getTexts = (params) => api.get('/texts', { params })
export const getText = (id) => api.get(`/texts/${id}`)
export const createText = (data) => api.post('/texts', data)
export const updateText = (id, data) => api.put(`/texts/${id}`, data)
export const deleteText = (id) => api.delete(`/texts/${id}`)

export default api
