# QWEN.md - ChatGPT Next Web 项目指南

## 项目概述

ChatGPT Next Web（现名 NextChat）是一个开源的一键部署跨平台 ChatGPT 网页 UI 项目，支持 GPT3、GPT4 和 Google Gemini Pro 模型。该项目允许用户快速部署自己的私人 ChatGPT 应用，并提供桌面客户端版本（Linux/Windows/MacOS）。项目注重隐私保护，所有数据存储在浏览器本地，并支持 Markdown 渲染、LaTeX 公式、Mermaid 图表等功能。

主要特性包括：
- 一键免费部署到 Vercel（1分钟内完成）
- 跨平台桌面客户端（约5MB大小）
- 完全兼容自部署 LLM（如 RWKV-Runner 或 LocalAI）
- 隐私优先，数据本地存储
- 支持多语言界面
- 快速首屏加载（约100KB）
- 面具功能（Prompt 模板）

## 技术栈

- **前端框架**: Next.js 13+
- **编程语言**: TypeScript
- **状态管理**: Zustand
- **UI 组件**: React
- **桌面应用**: Tauri
- **构建工具**: Webpack
- **样式**: Sass
- **包管理**: Yarn

## 项目结构

```
ChatGPT-Next-Web/
├── app/                    # Next.js 应用主目录
│   ├── api/               # API 路由
│   ├── components/        # React 组件
│   ├── config/            # 配置文件
│   ├── store/             # Zustand 状态管理
│   └── ...                # 其他页面和工具
├── public/                # 静态资源
├── src-tauri/             # Tauri 桌面应用配置
├── scripts/               # 构建脚本
├── docs/                  # 文档
├── .env.template          # 环境变量模板
├── next.config.mjs        # Next.js 配置
├── package.json           # 项目依赖和脚本
└── ...
```

## 开发与构建

### 环境要求
- Node.js >= 18
- Yarn

### 本地开发

1. 创建 `.env.local` 文件并配置 API 密钥：
```bash
OPENAI_API_KEY=<your-api-key>
CODE=your-password  # 可选，访问密码
```

2. 安装依赖并启动开发服务器：
```bash
yarn install
yarn dev
```

3. 访问 `http://localhost:3000`

### 构建项目

- **Web 版本**:
```bash
yarn build
```

- **导出静态版本**:
```bash
yarn export
```

- **桌面应用版本**:
```bash
yarn app:build  # 构建生产版本
yarn app:dev    # 开发模式运行桌面应用
```

### Docker 部署

```bash
# 拉取镜像
docker pull yidadaa/chatgpt-next-web

# 运行容器
docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY=sk-xxxx \
   -e CODE=your-password \
   yidadaa/chatgpt-next-web
```

## 环境变量

| 变量名 | 说明 | 是否必需 |
|--------|------|----------|
| `OPENAI_API_KEY` | OpenAI API 密钥，多个密钥可用逗号分隔 | 是 |
| `CODE` | 访问密码，多个密码可用逗号分隔 | 否 |
| `BASE_URL` | OpenAI API 请求的基础 URL | 否 |
| `GOOGLE_API_KEY` | Google Gemini Pro API 密钥 | 否 |
| `AZURE_URL` | Azure OpenAI 服务 URL | 否 |
| `PROXY_URL` | 代理 URL | 否 |
| `DISABLE_GPT4` | 设置为 1 来禁用 GPT-4 | 否 |
| `HIDE_USER_API_KEY` | 设置为 1 来隐藏用户的 API 密钥输入框 | 否 |

## 开发约定

- **代码风格**: 使用 ESLint 和 Prettier 进行代码格式化
- **提交规范**: 使用 Husky 和 lint-staged 进行提交前检查
- **类型安全**: 使用 TypeScript 进行类型检查
- **组件架构**: 使用 React 函数组件和 Hooks
- **状态管理**: 使用 Zustand 进行全局状态管理
- **API 调用**: 使用 Next.js API Routes 进行服务端请求

## 部署选项

1. **Vercel** (推荐): 一键部署，支持自动更新
2. **Docker**: 容器化部署，适合私有服务器
3. **云平台**: 支持部署到各种支持 Node.js 的云平台
4. **桌面应用**: 使用 Tauri 打包为原生桌面应用

## 重要配置文件

- `next.config.mjs`: Next.js 配置，包含重写规则和 Webpack 配置
- `tsconfig.json`: TypeScript 编译配置
- `package.json`: 项目元数据、依赖和脚本命令
- `tauri.conf.json`: Tauri 桌面应用配置
- `.env.template`: 环境变量模板

## 扩展功能

- **面具功能**: 允许用户创建预设的 Prompt 模板
- **API 代理**: 支持通过代理访问 OpenAI API
- **多模型支持**: 支持 OpenAI、Azure OpenAI 和 Google Gemini Pro
- **自定义模型**: 通过 `CUSTOM_MODELS` 环境变量控制模型列表
- **PWA 支持**: 渐进式 Web 应用功能