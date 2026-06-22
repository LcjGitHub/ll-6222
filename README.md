# 独立漫画市集备忘录

记录独立漫画市集的摊位与销量备忘。前后端分离，MVP 包含市集列表与单届详情（摊位 Table）。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + MUI · TanStack Query · dayjs · 端口 **4101** |
| 后端 | Flask + SQLite `./data/comic_fair.db` · 端口 **4000** |

## 目录结构

```
├── backend/          # Flask API
│   ├── app.py
│   ├── db.py
│   ├── requirements.txt
│   └── data/         # SQLite（首次启动自动创建并 seed）
└── frontend/         # React 前端
    ├── package.json
    └── src/
```

## 启动方式

### 1. 后端（端口 4000）

在项目根目录执行：

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
python app.py
```

后端启动后访问 `http://localhost:4000/api/fairs` 可验证 API。

### 2. 前端（端口 4101）

另开终端，在项目根目录执行：

```bash
cd frontend
npm install
npm run dev
```

浏览器打开 `http://localhost:4101`。

> 前端通过 Vite 代理将 `/api` 请求转发至后端 `4000` 端口，需先启动后端。

## 数据模型

**市集（Fair）**：名称、日期、城市

**摊位（Booth）**：摊位号、作品名、销量备注

首次启动会自动 seed **2 届市集，每届 3 个摊位**。

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/fairs` | 市集列表 |
| GET | `/api/fairs/:id` | 市集详情（含 booths） |
