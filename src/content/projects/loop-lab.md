---
title: Loop Lab
summary: 拆解 Coding Agent 的实现步骤，带一个可运行的迷你工作台。部署在 Cloudflare Workers 上。
stack:
  - TypeScript
  - Cloudflare Workers
status: 实验中
readme: private
order: 6
---

# Loop Lab

拆解 Cursor 这类 Coding Agent 是怎么做出来的：系统提示词、工具、多轮循环、分层记忆、上下文管理、安全边界。仓库里带一个可运行的迷你工作台——默认不需要 API Key。

GitHub（Private）：**https://github.com/ChaoJueAMeng/dev-pilot**

线上预览（Cloudflare Workers 免费 `workers.dev` 域名）：

**https://dev-pilot.confusion-coconut.workers.dev**

若第一次打开遇到挑战页或证书尚未就绪，稍等刷新即可。这是 Cloudflare 为 Agent 部署提供的临时账号；请在 60 分钟内打开对话里给出的认领链接，登录或注册 Cloudflare，把站点收到你自己的账号里，域名才会长期保留。

## 它演示什么

Coding Agent 不是「一个更大的聊天模型」，而是：

1. 用 system prompt 规定身份和边界
2. 暴露 `read_file` / `edit_file` / `run_command` 这类工具
3. 用 `while` 循环执行：推理 → 调工具 → 观察结果 → 再推理
4. 把记忆分成工作记忆、会话、长期记忆（`MEMORY.md`）
5. 截断和摘要上下文，而不是无限塞进窗口
6. 把文件系统和终端关进沙箱，再考虑流式、确认、Todo 等产品壳

本仓库的工作台在浏览器里跑完整循环：改的是虚拟文件，命令跑在虚拟 POSIX 子集上，碰不到你的真实磁盘。

## 本地运行

需要 Node.js 20+。克隆后执行 `npm install` 即可生成 lockfile（GitHub 上因体积未收录 `package-lock.json`）。

```bash
git clone https://github.com/ChaoJueAMeng/dev-pilot.git
cd dev-pilot
npm install
npm run dev
```

浏览器打开 [http://127.0.0.1:43217](http://127.0.0.1:43217)。

- `/` 步骤讲解
- `/playground` 迷你 Agent 工作台

点预置任务即可看到多轮工具调用。文件树、终端、`MEMORY.md` 会跟着变。

## 部署到 Cloudflare Workers

本仓库用 [vinext](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) 把 Next.js 16 编成 Worker。Worker 名是 `dev-pilot`，免费主机名为：

`https://dev-pilot.<你的子域>.workers.dev`

`vinext/server/fetch-handler` 是 Vite 虚拟入口，只有 `vinext build` 才会生成可部署的 Worker。Workers Builds 默认执行 `npm run build` 再 `npx wrangler deploy`，所以 `build` 必须是 `vinext build`，不能是 `next build`。

```bash
npm install
npm run deploy
```

Git 连接的 Workers Builds 保持默认命令即可：

- Build command：`npm run build`（即 `vinext build`）
- Deploy command：`npx wrangler deploy`（会读取构建生成的 `.wrangler/deploy/config.json`）

本地没有 Cloudflare 登录时，用临时预览账号：

```bash
npm run build
npx wrangler deploy --config dist/server/wrangler.json --temporary
```

认领成功后执行 `npx wrangler login`，以后直接 `npm run deploy`。本地 Next.js 构建用 `npm run build:next`。

## 可选：接入真实模型

工作台右上角「设置」里打开「使用真实模型」，填写 OpenAI 兼容的 Base URL、模型名和 API Key。Key 只存在浏览器本地，请求由 `/api/complete` 转发。也可以把 `OPENAI_API_KEY` 放到环境变量，作为服务端回退。

不填 Key 时，内置演示大脑会走同一套 Loop 和工具，方便理解机制。

## 代码从哪看

| 文件 | 作用 |
| --- | --- |
| `src/lib/agent/loop.ts` | Agent 循环 |
| `src/lib/agent/tools.ts` | 工具定义与执行 |
| `src/lib/agent/demo-brain.ts` | 无 Key 的演示「模型」 |
| `src/lib/agent/system-prompt.ts` | 系统提示词与记忆注入 |
| `src/lib/fs/virtual-fs.ts` | 虚拟文件系统 |
| `src/lib/fs/shell.ts` | 虚拟终端 |
| `src/content/steps.ts` | 讲解文案 |
| `src/app/api/complete/route.ts` | 可选的模型代理 |
| `wrangler.jsonc` | Cloudflare Workers 配置 |
| `vite.config.ts` | vinext / Vite 构建 |

## 建议你自己做时的顺序

先写 Loop 和两三个工具，用脚本跑通「读文件再改文件」。再接到真实 fs / 受限 shell。然后加记忆和截断。最后才做聊天 UI、diff、权限确认。没有循环，界面只是聊天框。
