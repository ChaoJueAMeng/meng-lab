---
title: 把 Next.js 页面当成 Worker 去部署，会在哪一步失败
description: next build 成功不等于你有一个 Worker。Workers Builds 跑完之后，wrangler 还是会去找入口文件。
pubDate: 2026-09-19
tags:
  - Cloudflare
  - 上线
---

`next build` 跑绿了，不等于你已经有一个 Cloudflare Worker。

我踩过的路径很典型：Git 推上去，Workers Builds 执行 `npm run build`，日志里能看到 Next.js 页面生成完成。下一步是 `npx wrangler deploy`。然后它开始找入口——`wrangler.jsonc` 里的 `main`，或者框架适配器写出来的 `_worker.js`。找不到，构建失败。

问题不在账号，也不在 Wrangler 本身。是**构建命令跑错了框架**。

- Next 的产物是 `.next/` 和一堆 HTML / server chunks。
- Worker 要的是一段能在边缘跑的入口脚本，外加静态资源目录。
- 两者之间没有默契。没有 `@opennextjs/cloudflare` 或类似适配器，就不会凭空冒出一个 Worker。

所以会出现这种错觉：页面都生成了，怎么还说没有 entrypoint？因为生成的是 Next 的结果，不是 Worker。

这个站不走那条路。它是 Astro 静态站点：`npm run build` 写出 `dist/`，`wrangler.jsonc` 只声明 `assets.directory = "./dist"`，没有 `main`。Cloudflare 当静态资源托管就够了。

以后如果真要上 Next，先确认构建产物里有 Worker 入口，再让 CI 去 `wrangler deploy`。不要假设「能 `next build` 就能上 Workers」。
