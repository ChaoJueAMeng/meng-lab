---
title: PulseChat
summary: 实时聊天。Java 后端加 uni-app 客户端，接过语音和图像。
stack:
  - Java
  - Spring Boot
  - uni-app
status: 已上线
href: https://github.com/ChaoJueAMeng/PulseChat-App/releases
readme: https://github.com/ChaoJueAMeng/PulseChat-App/blob/master/README.md
order: 4
---

# PulseChat App

uni-app（Vue3）霓虹脉冲风格 Android 客户端。

## 运行

1. 用 **HBuilderX** 打开本目录
2. 修改 [`utils/config.js`](https://github.com/ChaoJueAMeng/PulseChat-App/blob/master/utils/config.js) 中的后端地址：
   - 模拟器可继续用 `127.0.0.1`
   - **真机**请改为电脑局域网 IP，例如 `http://192.168.1.8:8080` / `ws://192.168.1.8:8080/ws`
3. 运行到 Android 基座或浏览器 H5

## 功能页

- 登录（手机号，免短信）
- 会话列表 / 实时聊天 / @ / 图片 / 撤回
- 通讯录与好友申请
- 建群、添加 Kimi、AI 流式气泡
- 个人资料

配套后端仓库：`PulseChat`
