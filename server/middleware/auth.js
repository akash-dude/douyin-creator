const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录，请先登录' })
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token 已过期或无效' })
  }
}
