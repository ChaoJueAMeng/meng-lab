---
title: 通知栏里直接问 AI：NotiAsk 为什么值得做
description: 问题经常出现在你已经盯着一条通知的时候。与其再打开一个聊天 App，不如在通知栏里 Direct Reply。
pubDate: 2026-08-29
tags:
  - Agent
  - 全栈
---

手机上问 AI，摩擦往往不在模型，而在「打开哪个 App」。

NotiAsk 做的事很窄：系统通知栏里直接回复。Android 的 Direct Reply 本来是给聊天用的，拿来把一句话交给模型，回一条通知。不用切应用，也不用先找到那个对话。

这和把大模型塞进一个完整即时通讯产品不是同一类问题。PulseChat 要账号、会话、推送、文件、在线状态；NotiAsk 只要在你**已经在看通知**的那几秒里接住问题。场景越窄，越说得清自己有没有用。

源码在 [ChaoJueAMeng/NotiAsk](https://github.com/ChaoJueAMeng/NotiAsk)。Kotlin，公开仓库。它提醒我一件事：Agent 不必先长成平台。能嵌进现有系统表面（通知、邮件、字幕时间轴）的那一层，往往比再做一个聊天窗更接近真实使用。
