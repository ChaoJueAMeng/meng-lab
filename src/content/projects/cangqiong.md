---
title: 苍穹外卖
summary: Spring Boot 外卖系统。管理端、小程序、证书和上传目录都实打实运维过。
stack:
  - Java
  - Spring Boot
  - uni-app
status: 已上线
href: https://cjameng.top/h5/
readme: private
order: 1
---

# 苍穹外卖

基于 Spring Boot 的外卖点餐系统后端，包含管理端与用户端（微信小程序）接口，支持订单管理、数据报表、WebSocket 催单，以及基于 LangChain4j 的 AI 智能菜单推荐。

## 技术栈

| 技术 | 说明 |
|------|------|
| Spring Boot 2.7.3 | 基础框架 |
| MyBatis-Plus | 数据持久化 |
| MySQL + Druid | 业务库与连接池 |
| Redis | 缓存、店铺营业状态等 |
| RabbitMQ | 订单延迟关单、支付成功消息 |
| JWT (jjwt) | 管理端 / 用户端鉴权 |
| Knife4j 3.0.2 | 在线接口文档 |
| WebSocket | 催单等实时通知 |
| 阿里云 OSS | 图片上传（可选本地存储） |
| 微信支付 | 小程序支付 |
| LangChain4j 0.36.2 | AI 智能推荐（OpenAI 兼容协议） |
| Apache POI | 运营数据 Excel 导出 |

## 模块结构

```
sky-take-out
├── sky-common    # 公共层：工具类、常量、异常、统一返回、配置属性
├── sky-pojo      # 数据模型：entity / dto / vo
└── sky-server    # 启动与业务：Controller、Service、Mapper、配置、MQ、WebSocket、AI
```

依赖关系：`sky-server` → `sky-common` + `sky-pojo`

## 功能概览

### 管理端（`/admin/**`）

- 员工登录与权限管理
- 分类 / 菜品 / 套餐 CRUD、启停售
- 文件上传（OSS 或本地存储）
- 店铺营业状态
- 订单接单、拒单、派送、完成
- 营业额 / 用户 / 订单统计、销量 Top10、Excel 导出
- 工作台今日经营数据
- WebSocket 接收催单等通知

### 用户端（`/user/**`）

- 微信登录
- 浏览分类、菜品、套餐
- 购物车、地址簿
- 下单、支付、历史订单、再来一单、催单
- **AI 智能菜单推荐**

## AI 智能推荐

基于 LangChain4j + Function Calling：大模型可自动查询用户历史订单偏好与当前起售菜单，再生成自然语言回复与结构化推荐列表。

支持任意 **OpenAI 兼容** 接口（Kimi / DeepSeek / 通义千问等）。

### 接口

```http
POST /user/ai/recommend
Header: authentication: <用户端 JWT>
Content-Type: application/json

{
  "message": "我想吃清淡一点的"
}
```

响应示例：

```json
{
  "code": 1,
  "data": {
    "reply": "根据您的口味，为您推荐以下几道清淡菜品……",
    "recommendations": [
      {
        "itemId": 1,
        "itemName": "清炒时蔬",
        "itemType": "dish",
        "price": 18.00,
        "image": "https://...",
        "description": "...",
        "reason": "清淡少油，符合您的需求"
      }
    ]
  }
}
```

`itemType` 取值：`dish`（菜品）或 `setmeal`（套餐）。

### 配置项（`sky.ai.*`）

| 配置键 | 默认值 | 说明 |
|--------|--------|------|
| `sky.ai.api-key` | （必填） | API Key，也可通过环境变量 `SKY_AI_API_KEY` 注入 |
| `sky.ai.base-url` | `https://api.moonshot.cn/v1` | OpenAI 兼容 Base URL |
| `sky.ai.model` | `moonshot-v1-32k` | 模型名称 |
| `sky.ai.max-tokens` | `2000` | 最大 Token |
| `sky.ai.temperature` | `0.7` | 温度 |
| `sky.ai.timeout-seconds` | `90` | 超时（秒） |
| `sky.ai.log-enabled` | `false` | 是否打印 LLM 请求/响应日志 |

厂商示例：

```yaml
# Kimi（默认）
sky:
  ai:
    api-key: ${SKY_AI_API_KEY:}
    base-url: https://api.moonshot.cn/v1
    model: moonshot-v1-32k

# DeepSeek
#   base-url: https://api.deepseek.com
#   model: deepseek-chat

# 通义千问
#   base-url: https://dashscope.aliyuncs.com/compatible-mode/v1
#   model: qwen-plus
```

> 未配置 `sky.ai.api-key` 时服务将无法启动。

## 环境要求

- JDK 8+
- Maven 3.6+（或使用项目自带 `mvnw`）
- MySQL
- Redis
- RabbitMQ（需安装 [延迟消息插件](https://github.com/rabbitmq/rabbitmq-delayed-message-exchange)）
- AI 服务 API Key（Kimi / DeepSeek / 通义等）

可选：阿里云 OSS、微信小程序 AppId/Secret、微信支付、百度地图 AK。

## 快速开始

### 1. 准备配置文件

仓库已提供示例配置（不含真实密钥）。复制后填写本地值：

```bash
cd sky-server/src/main/resources
cp application.yml.example application.yml
cp application-dev.yml.example application-dev.yml
```

Windows（PowerShell）：

```powershell
cd sky-server\src\main\resources
Copy-Item application.yml.example application.yml
Copy-Item application-dev.yml.example application-dev.yml
```

```
sky-server/src/main/resources/
├── application.yml.example      # 可提交
├── application-dev.yml.example  # 可提交
├── application.yml              # 本地填写，勿提交
└── application-dev.yml          # 本地敏感配置，勿提交
```

按需修改 MySQL / Redis / RabbitMQ / JWT / AI Key 等；OSS、微信、百度等为可选配置。
### 2. 启动

```bash
# 根目录
./mvnw -pl sky-server -am spring-boot:run

# Windows
mvnw.cmd -pl sky-server -am spring-boot:run
```

或在 IDE 中运行主类 `com.sky.SkyApplication`。

### 3. 接口文档

启动后访问：[http://localhost:8080/doc.html](http://localhost:8080/doc.html)（Knife4j，含管理端 / 用户端分组）

## 目录结构

```
CangQiongWaiMai/
├── pom.xml
├── mvnw / mvnw.cmd
├── sky-common/          # 公共模块
├── sky-pojo/            # 实体与传输对象
└── sky-server/
    └── src/main/java/com/sky/
        ├── SkyApplication.java
        ├── ai/              # AI 助手与工具
        ├── config/          # Redis / MQ / OSS / WebMvc / LangChain4j 等
        ├── controller/
        │   ├── admin/       # 管理端接口
        │   └── user/        # 用户端接口
        ├── handler/
        ├── interceptor/     # JWT 拦截器
        ├── listener/        # MQ 监听（延迟关单、支付成功）
        ├── mapper/
        ├── service/
        ├── task/            # 定时任务
        └── websocket/       # WebSocket 服务
```

## 注意事项

1. **切勿提交** `application-dev.yml`、`.env` 等含数据库密码、API Key、微信密钥的文件。
2. RabbitMQ 延迟关单依赖 delayed message 插件，未安装会导致相关交换机声明失败。
3. 管理端请求头默认使用 `token`，用户端使用 `authentication`。
4. AI 推荐依赖外部大模型服务，网络与配额异常时请检查 `sky.ai.*` 配置与服务商控制台。

## License

仅供学习与实战参考。
