## Why

前后端异常处理不一致：后端混用 HTTPException/ResponseModel(code=xxx) 两种模式返回业务错误，前端需两条路径处理；前端自身异常（运行时错误、表单校验、网络断连）无全局捕获机制，catch 块中硬编码文案散落各页面。

## What Changes

- 后端新增 `ErrorCode` 统一业务错误码枚举（1xxxx 通用/2xxxx 认证/3xxxx 业务）和 `BizException` 异常类，业务错误统一走 HTTP 200 + body.code 返回
- 后端 API 层将散落的 `HTTPException(400/403/404)` 替换为 `BizException(ErrorCode.XXX)`
- 前端新增 `errors.js`：`BizError` 前端异常枚举 + `ErrorCodeMap` 后端错误码映射 + `showBizError`/`getErrorMsg`/`isAuthError` 函数
- 前端新增全局运行时异常捕获（Vue errorHandler + unhandledrejection）
- 前端请求拦截器对接后端统一错误码，认证类错误(20001/20002)自动登出跳转

## Capabilities

### New Capabilities
- `backend-error-codes`: 后端统一业务错误码枚举 + BizException 异常体系 + 全局异常处理器
- `frontend-error-handling`: 前端异常枚举定义 + 全局运行时捕获 + 请求拦截器对接后端错误码

### Modified Capabilities
<!-- 无已有 spec 需要修改 -->

## Impact

- **影响范围**：用户端 + 管理端
- **后端**：app/core/ 新增 2 文件，app/main.py 新增处理器，app/api/v1/ 下 12 个文件替换 HTTPException
- **前端**：src/utils/common/ 新增 1 文件，src/utils/request/index.js 改造拦截器，src/main.js 集成全局捕获
- **API 兼容性**：**BREAKING** — 业务错误响应从 HTTP 4xx 改为 HTTP 200 + body.code，前端拦截器已同步适配

## 非目标

- 不做错误上报/埋点
- 不主动重构现有页面 catch 块（新代码逐步使用新规范）
- 不做前端错误码与后端 ErrorCode 的完整双向映射表
- 后端 auth.py 中 get_current_user 的 401 HTTPException 保留不变（FastAPI Depends 机制需要）
