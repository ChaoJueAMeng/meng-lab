---
title: 给 Agent 写文件之前，先挡住工作区里的 .env
description: 模型能改文件、跑命令之后，怕的是它被眼前这个仓库带着走。工作区里的 .env 不能改写已经配好的 API 地址。
pubDate: 2026-09-20
tags:
  - Agent
  - Java
---

本地 Coding Agent 一旦能改文件、跑命令，怕的不是它写错一行，是你不知道它改了什么，以及它会不会被眼前这个仓库带着走。

M-harness 的边界写在工具外面。Ask 只读。Agent 真正改工作区之前先拍快照：目录里已有 `.git` 就写入该仓库的 ref，否则写到 `~/.m-harness/checkpoints/`，不会在用户目录 `git init`。`git push --force`、`git reset --hard` 这类命令直接拒绝，自动批准也盖不过去。

更早翻过的车在配置。Key 是全局的，放在用户目录的 `.env`。如果允许工作区里的 `.env` 改写 `M_HARNESS_BASE_URL`，打开一个仓库就能把 Key 发到别人的服务器。所以工作区文件只在全局和环境变量都没有 Key 时才回退。

源码在 [ChaoJueAMeng/M-harness](https://github.com/ChaoJueAMeng/M-harness)。Java，公开仓库。它提醒我一件事：工作区里的说明和配置都是不可信输入。Agent 的权限不能靠提示词守住。
