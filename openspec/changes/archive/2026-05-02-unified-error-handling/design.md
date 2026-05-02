## Context

当前前后端异常处理存在三类问题：

1. **后端错误返回模式不一致** — 部分 API 用 `HTTPException(400, detail)` 返回 HTTP 4xx，部分用 `ResponseModel(code=404)` 返回 HTTP 200。前端 `request/index.js` 需在 `responseInterceptorsCatch`（HTTP 状态码错误）和 `transformRequestHook`（body.code 错误）两条路径分别处理。
2. **后端错误码硬编码** — 各 API 文件中 `"报销单不存在"`、`"无权限"` 等文案散落，无统一枚举，难以维护和国际化。
3. **前端无全局异常兜底** — JS 运行时错误和未捕获的 Promise rejection 静默失败，catch 块中硬编码提示文案不统一。

利益相关者：前端开发者、后端开发者、终端用户（看到更一致的错误提示）。

## Goals / Non-Goals

**Goals:**
- 后端业务错误统一走 HTTP 200 + body.code，前端只需一条路径处理
- 后端定义统一的 ErrorCode 枚举，消除硬编码
- 前端定义 BizError 枚举处理自身异常，与后端 ErrorCode 互补不重复
- 前端全局捕获运行时异常，避免静默失败
- 前端请求拦截器对接后端错误码，自动处理认证类错误

**Non-Goals:**
- 错误上报/埋点（当前无需求）
- 国际化错误文案（当前仅中文）
- 重构现有页面 catch 块（新代码逐步使用）
- 前端错误码与后端 ErrorCode 的完整双向映射

## Decisions

### D1: 业务错误统一走 HTTP 200 + body.code

**选择**：BizException 返回 HTTP 200，body 中携带 code + message + data

**替代方案**：
- A) 继续 HTTP 4xx + body：前端需维护两条处理路径，复杂度高
- B) 完全移除 HTTP 状态码语义：与 RESTful 规范冲突过大

**理由**：HTTP 状态码用于协议层（401 认证、429 限流、5xx 服务端错误），业务错误用 body.code 区分，前端 transformRequestHook 统一处理。

### D2: 错误码分段编码

**选择**：1xxxx 通用 / 2xxxx 认证权限 / 3xxxx 业务（按模块细分 301xx~311xx）

**理由**：分段编码便于快速定位模块，新增模块只需分配新段号，不与已有码冲突。

### D3: 前端异常与后端错误码分离

**选择**：前端 BizError 只定义前端自身产生的异常（表单校验、网络断连、运行时错误），后端 ErrorCode 由 ErrorCodeMap 做兜底映射

**理由**：接口报错优先使用后端返回的 message，ErrorCodeMap 仅做兜底。前端异常枚举不与后端重复，职责清晰。

### D4: 全局异常用 Toast 提示

**选择**：运行时异常和业务异常统一走 showErrorToast（TDesign Toast error 主题）

**替代方案**：运行时用 Dialog、业务用 Toast — 增加复杂度且移动端体验较重

**理由**：Toast 轻量、不打断用户操作、符合移动端习惯。

## 数据流图

```
┌─────────────────────────────────────────────────────────────┐
│                        后端                                  │
│                                                             │
│  API 层抛出 BizException(ErrorCode.XXX)                     │
│           │                                                 │
│           ▼                                                 │
│  main.py: biz_exception_handler                             │
│           │                                                 │
│           ▼                                                 │
│  响应: HTTP 200 { code: 30xx, message: "文案", data: null } │
│                                                             │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                                             │
│  auth.py: get_current_user 抛出 HTTPException(401)          │
│           │                                                 │
│           ▼                                                 │
│  main.py: http_exception_handler                            │
│           │                                                 │
│           ▼                                                 │
│  响应: HTTP 401 { code: 401, message: "未提供认证令牌" }    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                        前端                                  │
│                                                             │
│  Axios 响应拦截                                             │
│           │                                                 │
│     ┌─────┴─────┐                                          │
│     │           │                                           │
│  HTTP 200   HTTP 4xx/5xx                                    │
│     │           │                                           │
│  transform   responseInterceptorsCatch                      │
│  RequestHook     │                                          │
│     │        401→Dialog+登出                                │
│  code=200?      429→Dialog                                  │
│  ├─Yes→返回    其他→Toast+重试                              │
│  └─No→         │                                           │
│     │                                                    │
│  isAuthError?                                             │
│  ├─Yes→Toast+登出+跳转                                    │
│  └─No→throw ValidationError                               │
│     │                                                    │
│  页面 catch 块                                             │
│     │                                                    │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─                    │
│                                                             │
│  前端自身异常                                               │
│           │                                                 │
│     ┌─────┴──────┐                                         │
│  表单校验     运行时异常                                    │
│     │              │                                        │
│  showBizError   app.config.errorHandler                     │
│  (BizError.XXX)  window.unhandledrejection                  │
│     │              │                                        │
│     └──────┬───────┘                                       │
│            ▼                                                │
│     showErrorToast(文案)                                    │
└─────────────────────────────────────────────────────────────┘
```

## API 变更说明

### 业务错误响应（变更后）

所有业务错误统一返回 HTTP 200，body 格式：

```json
{
  "code": 30401,
  "message": "报销单不存在",
  "data": null
}
```

### HTTP 协议层错误（不变）

| HTTP 状态码 | 触发场景 | 响应格式 |
|---|---|---|
| 401 | Token 无效/未提供（get_current_user） | `{ code: 401, message: "...", data: null }` |
| 422 | 请求参数校验失败（Pydantic） | `{ code: 422, message: "字段: 错误", data: null }` |
| 429 | 限流（中间件） | HTTP 429 |
| 500 | 未知异常 | `{ code: 500, message: "服务器内部错误", data: null }` |

## Risks / Trade-offs

- **[BREAKING API 变更]** 业务错误从 HTTP 4xx 改为 HTTP 200 → 前端拦截器已同步适配，需前后端同时部署
- **[ErrorCode 膨胀]** 新增业务场景需持续补充错误码 → 编码规则预留了段号空间，新增成本低
- **[get_current_user 401 保留]** FastAPI Depends 机制依赖 HTTP 状态码 → 前端 responseInterceptorsCatch 已有 401 处理逻辑，无需改动
- **[全局捕获误报]** unhandledrejection 可能捕获正常的路由导航中断 → 已过滤 NavigationDuplicated 类型

## Migration Plan

1. 后端先部署（新增 error_codes.py、exceptions.py 不影响现有代码）
2. 前端部署（拦截器适配 HTTP 200 + body.code，同时兼容旧 HTTP 4xx）
3. 两端同时上线后，API 层的 HTTPException → BizException 改造自动生效

**回滚策略**：前端拦截器同时处理 HTTP 4xx 和 body.code 两种模式，回滚后端时前端仍可正常工作。
