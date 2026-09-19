---
title: 根域名被业务占着时，给新产品开子域名
description: 苍穹已经占着 cjameng.top，PulseChat 不该再去抢根路径。主机记录只填 pulse，解析要加在对的那份 DNS 上。
pubDate: 2026-09-18
tags:
  - 上线
  - 全栈
---

根域名一旦交给一个已经在跑的服务，就不要再让第二个系统去抢 `/api` 和 `/ws`。

`cjameng.top` 当时是苍穹外卖。PulseChat 也要对外，如果继续挂在同一个 host、同一套路径上，证书、反向代理、静态资源和 WebSocket 会搅在一起。正确的拆法是另开子域名，例如 `pulse.cjameng.top`，让 Nginx 按 `server_name` 分流。

两件特别容易写错的小事：

1. **主机记录只填 `pulse`**，不要填 `pulse.cjameng.top`。后者会变成四级域名，解析看起来「加了」，公网永远找不到。
2. **加在正在生效的那份 DNS 上。** 域名商和 Cloudflare 往往各有一份记录。NS 还没切过去时，改 Cloudflare 等于改空气；NS 已经指过去时，改域名商也一样没用。

证书也按这个边界走：子域名用自己的 SAN，不要指望根域名那张证书自动覆盖你刚发明的名字。业务之间的上传目录、Redis、数据库也不要图省事共用。

博客同样不该去抢根域名。这个站以后绑 `notes.cjameng.top` 或 `lab.cjameng.top` 即可。
