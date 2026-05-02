## ADDED Requirements

### Requirement: 前端业务异常枚举
前端 SHALL 定义 `BizError` 枚举对象，仅包含前端自身产生的异常场景：表单校验（FORM_INVALID、FIELD_REQUIRED、FIELD_INVALID）、网络系统（NETWORK_ERROR、REQUEST_TIMEOUT、SYSTEM_ERROR）、权限（PERMISSION_DENIED）。BizError SHALL NOT 与后端 ErrorCode 重复。

#### Scenario: 前端表单校验失败
- **WHEN** 用户提交表单但必填项为空
- **THEN** 调用 `showBizError(BizError.FIELD_REQUIRED)`，显示 Toast "必填项不能为空"

#### Scenario: 前端网络断连
- **WHEN** 请求因网络断连失败
- **THEN** 调用 `showBizError(BizError.NETWORK_ERROR)`，显示 Toast "网络异常，请检查连接"

#### Scenario: 前端异常不与后端重复
- **WHEN** 接口返回业务错误（如报销单不存在）
- **THEN** 由请求拦截器展示后端返回的 message，不使用 BizError 枚举

### Requirement: 后端错误码映射
前端 SHALL 定义 `ErrorCodeMap` 对象，映射后端 ErrorCode 到中文兜底文案。`getErrorMsg(code, serverMsg)` 函数 SHALL 优先使用后端返回的 message，当 message 为空时使用 ErrorCodeMap 兜底。`AUTH_ERROR_CODES` 数组 SHALL 包含需要跳转登录页的错误码（20001、20002）。

#### Scenario: 优先使用后端 message
- **WHEN** 后端返回 `{ code: 30401, message: "报销单不存在" }`
- **THEN** `getErrorMsg(30401, "报销单不存在")` 返回 "报销单不存在"

#### Scenario: 后端 message 为空时兜底
- **WHEN** 后端返回 `{ code: 30401, message: "" }`
- **THEN** `getErrorMsg(30401, "")` 返回 ErrorCodeMap[30401] 即 "报销单不存在"

#### Scenario: 未知错误码兜底
- **WHEN** 后端返回未定义的错误码 99999
- **THEN** `getErrorMsg(99999, "")` 返回 "操作失败，请稍后重试"

#### Scenario: 判断认证类错误
- **WHEN** 错误码为 20001 或 20002
- **THEN** `isAuthError(code)` 返回 true

### Requirement: 业务异常提示函数
前端 SHALL 提供 `showBizError(errorKey, fallbackMsg)` 函数，统一通过 TDesign Toast error 主题展示错误提示。当提供 fallbackMsg 时 SHALL 覆盖 errorKey 的默认文案。

#### Scenario: 使用枚举默认文案
- **WHEN** 调用 `showBizError(BizError.OPERATION_FAILED)`
- **THEN** 显示 TDesign Toast（error 主题），内容为 "操作失败，请稍后重试"

#### Scenario: 覆盖默认文案
- **WHEN** 调用 `showBizError(BizError.OPERATION_FAILED, "发布失败，请重试")`
- **THEN** 显示 Toast 内容为 "发布失败，请重试"

### Requirement: 全局运行时异常捕获
前端 SHALL 在 main.js 中调用 `setupGlobalErrorHandler(app)`，注册 Vue `app.config.errorHandler` 捕获组件内未处理异常，注册 `window.unhandledrejection` 捕获未处理的 Promise rejection。两者 SHALL 统一调用 `showErrorToast(BizError.SYSTEM_ERROR)` 提示用户，同时在控制台打印错误信息。unhandledrejection SHALL 过滤 NavigationDuplicated 类型的路由导航中断。

#### Scenario: Vue 组件内未捕获异常
- **WHEN** 组件内 throw new Error("xxx") 未被 try/catch 捕获
- **THEN** 显示 Toast "系统异常，请稍后重试"，控制台打印 `[全局异常] Error: xxx`

#### Scenario: 未捕获的 Promise rejection
- **WHEN** Promise reject 但无 .catch() 处理
- **THEN** 显示 Toast "系统异常，请稍后重试"，控制台打印 `[未处理的Promise异常]`

#### Scenario: 路由导航中断不提示
- **WHEN** unhandledrejection 的 reason.name 为 "NavigationDuplicated"
- **THEN** 不显示 Toast，不打印错误

### Requirement: 请求拦截器对接后端错误码
前端 `transformRequestHook` SHALL 在 body.code !== 200 时使用 `getErrorMsg(data.code, data.message)` 获取友好文案。当 `isAuthError(data.code)` 为 true 时，SHALL 自动执行登出、跳转登录页、显示 Toast 提示，不抛出异常给业务层。非认证类错误 SHALL 抛出 ValidationError，message 为 getErrorMsg 返回的友好文案。

#### Scenario: 认证类错误自动处理
- **WHEN** 后端返回 `{ code: 20002, message: "登录已过期" }`
- **THEN** 自动执行 userStore.logout()、跳转 /login、显示 Toast "登录已过期"

#### Scenario: 业务错误抛出友好文案
- **WHEN** 后端返回 `{ code: 30203, message: "时间冲突" }`
- **THEN** 抛出 ValidationError，message 为 "时间冲突"

#### Scenario: 业务错误 message 为空时兜底
- **WHEN** 后端返回 `{ code: 30203, message: null }`
- **THEN** 抛出 ValidationError，message 为 ErrorCodeMap[30203] 即 "时间冲突"

### Requirement: 自动导入集成
errors.js 的所有导出 SHALL 通过 unplugin-auto-import 自动注册为全局变量（vite.config.js 已配置 `dirs: ['src/utils/common']`），页面中无需手动 import 即可直接使用 BizError、showBizError、getErrorMsg、isAuthError、setupGlobalErrorHandler。
