# douyin-creator

抖音创作辅助工具 — 文本创作 + 云端保存 C/S 架构

## 项目结构

```
douyin-creator/
├── client/          # Vue 3 前端
│   ├── src/
│   │   ├── api/     # Axios API 封装
│   │   ├── views/   # 页面组件
│   │   └── App.vue  # 根组件
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/          # Node.js + Express 后端
│   ├── routes/      # 路由（auth, texts, users）
│   ├── models/      # Mongoose 模型
│   ├── middleware/   # 认证中间件
│   ├── index.js     # 入口
│   └── package.json
│
└── README.md
```

## 数据流

```
[用户创作文本] → Vue 3 收集 → axios POST /api/texts
                 → Express 路由 → Mongoose → MongoDB（云端）
                 → 返回保存结果 → 前端更新 UI
```

## 快速开始

### 1. 启动 MongoDB

```bash
# 本地开发：确保 MongoDB 运行在 localhost:27017
mongod
```

### 2. 安装依赖

```bash
# 后端
cd server && npm install

# 前端
cd ../client && npm install
```

### 3. 配置环境变量

```bash
cp server/.env.example server/.env
# 编辑 .env 修改 MongoDB 连接串和 JWT 密钥
```

### 4. 启动

```bash
# 终端 1：启动后端
cd server && npm run dev

# 终端 2：启动前端
cd client && npm run dev
```

前端默认运行在 `http://localhost:5173`，API 已配置代理到后端 `:3000`。

## API 接口

### Auth
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录 |

### 文本 CRUD
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/texts` | 获取列表（分页+搜索+筛选） |
| GET | `/api/texts/:id` | 获取详情 |
| POST | `/api/texts` | 创建（保存到云端） |
| PUT | `/api/texts/:id` | 更新 |
| DELETE | `/api/texts/:id` | 删除 |

### User
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/users/me` | 当前用户信息 |

## 部署

### Railway

```bash
# 后端
railway login
railway init
railway up
```

### Zeabur

直接在 Zeabur 控制台关联 GitHub 仓库，选择 `server/` 作为根目录部署。

部署时设置环境变量：
- `MONGODB_URI` — MongoDB Atlas 连接串
- `JWT_SECRET` — 随机字符串
