# Agent Interviewer

> 🚀 **一款部署在本地的 AI 智能面试助手网页应用** —— 输入岗位 JD，AI 自动帮你分析公司文化、评估岗位匹配度、预测面试问题并生成完整参考回答。简约高级的毛玻璃风格，保护你的隐私，所有数据都在本地运行。

---

## ✨ 它能帮你做什么？

### 🎯 精准岗位分析
自动拆解岗位职责和任职要求，帮你快速理解岗位核心需求，不再盲目海投。

### 🏢 深度公司研究
从权威渠道挖掘目标公司的**企业文化、核心价值观、使命愿景**，面试前知己知彼，答出"懂行"的感觉。找不到就如实告诉你，绝不瞎编。

### 📊 匹配度评估
结合你的简历和背景，量化评估你与岗位的匹配程度，指出优势和需要补强的地方。

### 🎤 面试题预测 + 完整回答
按照真实面试流程分板块预测问题（自我介绍 → 专业知识 → 简历深挖 → 项目经验 → 职业规划 → 行为面试 → 反问环节），每个问题都附带**可直接使用的完整参考回答**，不再只给你"建议用 STAR 法则"这种空泛提示。

### 🔐 完全本地部署
你的简历、API Key、求职信息**全部在本地运行**，不会上传到任何第三方服务器（除了你自己配置的 AI 模型 API）。支持 9 种主流 AI 模型提供商，自由切换。

---

## 🎬 功能演示

### 1. 配置 AI API
支持 OpenAI、Agnes AI（免费）、DeepSeek、通义千问、Kimi、Groq 等 9 种提供商，一键测试连接。

<video controls src="public/1配置AI API.mp4" width="100%"></video>

### 2. 信息输入
填写岗位 JD（必填），可选上传简历、补充材料（文本/附件双模式）、职业规划。

<video controls src="public/2信息输入.mp4" width="100%"></video>

### 3. 结果呈现
公司文化分析 + 岗位匹配度评估 + 按板块分类的面试问题预测，点击展开即可查看完整参考回答。

<video controls src="public/3结果呈现演示.mp4" width="100%"></video>

---

## 🛠️ 技术栈

### 前端
- **React 19** - 用户界面框架
- **Vite 6** - 构建工具
- **TailwindCSS 3** - 样式框架
- **Lucide React** - 图标库

### 后端
- **FastAPI** - API 框架（同时托管前端静态文件，一个命令启动全栈）
- **Python 3.10+** - 编程语言
- **Uvicorn** - ASGI 服务器
- **OpenAI SDK** - 兼容所有 OpenAI 格式的 API

---

## 📦 安装与运行

### 前置要求

- Node.js 18+
- Python 3.10+

### 快速开始

1. **克隆项目**
```bash
git clone https://github.com/perriluo05-lagom/interview-master.git
cd interview-master
```

2. **安装前端依赖并构建**
```bash
npm install
npm run build
```

3. **安装后端依赖**
```bash
pip install -r backend/requirements.txt
```

4. **启动应用**（只需启动后端，它会同时托管前端页面）
```bash
cd backend
python run.py
```

5. **打开浏览器访问**：http://localhost:8000

> 💡 **开发模式**：如需热更新，可额外启动前端开发服务器：`npm run dev`（Vite 会自动代理 `/api` 请求到后端）。

### 配置 AI API Key

1. 页面右上角点击「API 配置」
2. 选择你的 API 提供商（推荐 Agnes AI，免费额度充足）
3. 粘贴 API Key
4. 点击「测试连接」，成功后即可使用

> 不配置 API Key 也能使用**演示模式**预览效果（数据为模拟数据）。

---

## 📁 项目结构

```
interview-master/
├── public/                # 静态资源（演示视频等）
├── src/                   # 前端源码
│   ├── components/        # 组件目录
│   │   └── GlassSelect.jsx
│   ├── App.jsx           # 主应用组件
│   ├── main.jsx          # 入口文件
│   └── index.css         # 全局样式
├── backend/              # 后端服务
│   ├── main.py          # FastAPI 应用
│   ├── run.py           # 启动脚本
│   └── requirements.txt # Python 依赖
├── index.html            # HTML 模板
├── vite.config.js        # Vite 配置（含 API 代理）
├── tailwind.config.js    # TailwindCSS 配置
└── package.json          # 项目配置
```

---

## 🚀 使用流程

1. **输入信息**：粘贴岗位 JD（必填），上传简历、补充材料（文本或附件）、职业规划
2. **开始分析**：点击「开始 AI 智能分析」
3. **查看结果**：
   - 公司分析：价值观、使命、愿景（基于权威渠道，找不到如实说明）
   - 岗位分析：职责解读 + 匹配度评分
4. **面试准备**：按面试真实顺序浏览各板块预测问题，展开查看完整参考回答

---

## 📝 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/api/health` | 健康检查 |
| GET  | `/api/providers` | 获取支持的 API 提供商列表 |
| POST | `/api/analyze` | 分析岗位信息 |
| POST | `/api/test-api` | 测试 API Key 是否有效 |
| POST | `/api/upload-resume` | 上传简历文件 |

---

## 📄 License

MIT License

---

> 💡 **小提示**：本项目仅用于个人学习和面试准备辅助，AI 生成的内容仅供参考，请结合自身实际情况调整回答。祝你拿到心仪的 offer！ 🎉
