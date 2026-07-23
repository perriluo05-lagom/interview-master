# Agent Interviewer

基于 AI 的智能面试准备助手，帮助您分析岗位、预测面试题、生成回答建议。

## ✨ 功能特性

- **岗位分析**：自动分析岗位 JD，解读岗位职责和要求
- **公司研究**：分析招聘公司的企业文化、使命、愿景（基于权威渠道，找不到不编造）
- **匹配度评估**：基于您的求职偏好和过往经历分析岗位匹配度
- **面试题预测**：按面试真实顺序分板块预测（自我介绍→专业知识→简历深挖→项目经验→职业规划→行为面试→反问环节）
- **完整参考回答**：为每个预测问题生成可直接使用的完整回答示例
- **多模型支持**：支持 OpenAI、Agnes AI、DeepSeek、通义千问、Kimi、Groq 等 9 种 API 提供商
- **补充材料双模式**：支持文本/链接输入或上传附件两种方式

## 🎨 设计风格

- **简约高级**：深色主题，营造专业氛围
- **毛玻璃效果**：高模糊度半透明卡片，柔和渲染画面
- **光晕动画**：动态光影效果，增强视觉层次感
- **渐变蒙版**：视频与文字区域无缝融合
- **华文中宋字体**：优雅的中文排版体验

## 🛠️ 技术栈

### 前端
- **React 19** - 用户界面框架
- **Vite 6** - 构建工具
- **TailwindCSS 3** - 样式框架
- **Lucide React** - 图标库

### 后端
- **FastAPI** - API 框架（同时托管前端静态文件）
- **Python 3.10+** - 编程语言
- **Uvicorn** - ASGI 服务器

## 📦 安装与运行

### 前置要求

- Node.js 18+
- Python 3.10+

### 安装步骤

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

### 运行应用

只需启动后端即可（后端会同时托管前端页面）：
```bash
cd backend
python run.py
```

然后在浏览器中访问：**http://localhost:8000**

> 💡 如需开发模式（热更新），可单独启动前端：`npm run dev`，前端会自动代理 `/api` 请求到后端 `http://localhost:8000`。

### 配置 AI API

1. 打开页面后点击右上角「API 配置」
2. 选择 API 提供商（推荐 Agnes AI，免费）
3. 输入对应平台的 API Key
4. 点击「测试连接」验证

> 若不配置 API Key，系统将使用演示模式生成模拟数据。

## 📁 项目结构

```
interview-master/
├── src/                    # 前端源码
│   ├── components/         # 组件目录
│   │   └── GlassSelect.jsx # 毛玻璃下拉组件
│   ├── App.jsx            # 主应用组件
│   ├── main.jsx           # 入口文件
│   └── index.css          # 全局样式
├── backend/               # 后端服务
│   ├── main.py           # FastAPI 应用
│   ├── run.py            # 启动脚本
│   └── requirements.txt  # Python 依赖
├── public/               # 静态资源
├── index.html            # HTML 模板
├── vite.config.js        # Vite 配置（含 API 代理）
├── tailwind.config.js    # TailwindCSS 配置
├── postcss.config.js     # PostCSS 配置
└── package.json          # 项目配置
```

## 🚀 使用流程

1. **输入信息**：填写岗位 JD（必填）、上传简历（可选）、补充材料（可选，文本或附件）、职业规划（可选）
2. **智能分析**：点击「开始 AI 智能分析」，AI 将分析岗位需求、公司文化、匹配度
3. **查看结果**：浏览公司分析（价值观/使命/愿景）、岗位分析和匹配度评估
4. **面试准备**：查看按板块分组的面试问题预测，展开查看完整参考回答

## 📝 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/api/health` | 健康检查 |
| GET  | `/api/providers` | 获取支持的 API 提供商列表 |
| POST | `/api/analyze` | 分析岗位信息 |
| POST | `/api/test-api` | 测试 API Key 是否有效 |
| POST | `/api/upload-resume` | 上传简历文件 |

## 📄 License

MIT License

---

*Agent Interviewer - AI 驱动的智能面试助手*
