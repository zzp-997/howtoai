/**
 * 统一异常处理
 *
 * 职责划分：
 * - 后端返回的接口错误 → 由 request 拦截器处理，展示后端 message
 * - 前端自身异常 → 使用 BizError 枚举，不与后端重复
 */
import { showErrorToast } from './tools'

/**
 * 前端业务异常枚举（不与后端 ErrorCode 混用）
 * 仅覆盖前端自身产生的异常场景
 */
export const BizError = {
  // 表单/输入 — 前端校验不通过
  FORM_INVALID: '请检查填写内容',
  FIELD_REQUIRED: '必填项不能为空',
  FIELD_INVALID: '输入格式不正确',

  // 网络/系统 — 前端感知到的异常（后端无法触达的场景）
  NETWORK_ERROR: '网络异常，请检查连接',
  REQUEST_TIMEOUT: '请求超时，请稍后重试',
  SYSTEM_ERROR: '系统异常，请稍后重试',

  // 权限 — 前端路由守卫层
  PERMISSION_DENIED: '暂无权限，请联系管理员',
}

/**
 * 后端错误码映射表
 *
 * 大部分场景直接展示后端 message 即可，此表仅用于：
 * 1. 后端 message 为空时的兜底文案
 * 2. 前端需要特殊处理的错误码判断（如 isAuthError）
 */
export const ErrorCodeMap = {
  // 通用
  10001: '请求参数错误',
  10002: '数据校验失败',
  10003: '资源不存在',
  10004: '请勿重复操作',
  10005: '操作失败，请稍后重试',

  // 认证/权限 — 需要跳转登录页
  20001: '请先登录',
  20002: '登录已过期',
  20003: '暂无权限',
  20004: '账号已禁用',
  20005: '用户名或密码错误',

  // 审批
  30101: '申请不存在',
  30102: '审批链不存在',
  30103: '审批链无效',
  30104: '审批状态不允许此操作',
  30105: '审批操作失败',

  // 会议室/预定
  30201: '会议室不存在',
  30202: '预定不存在',
  30203: '时间冲突',

  // 考勤
  30301: '补卡申请不存在',
  30302: '补卡操作失败',

  // 报销
  30401: '报销单不存在',
  30402: '报销单状态不允许此操作',

  // 文档
  30501: '文档不存在',
  30502: '无权限操作此文档',

  // 差旅
  30601: '差旅申请不存在',
  30602: '差旅状态不允许此操作',

  // 请假
  30701: '请假申请不存在',
  30702: '请假状态不允许此操作',
  30703: '日期与已存在的请假申请重叠',

  // 配置
  30801: '配置不存在',
  30802: '模板不存在',
  30803: '城市不存在',
  30804: '节假日配置不存在',

  // 公告
  30901: '公告不存在',

  // 待办
  31001: '待办不存在',

  // 用户
  31101: '用户不存在',
}

/** 需要跳转登录页的错误码 */
export const AUTH_ERROR_CODES = [20001, 20002]

/**
 * 业务异常提示（统一走 Toast）
 * @param {string} errorKey - BizError 枚举值
 * @param {string} [fallbackMsg] - 可选，覆盖默认文案
 */
export function showBizError(errorKey, fallbackMsg) {
  showErrorToast(fallbackMsg || errorKey)
}

/**
 * 根据后端错误码获取提示文案
 * 优先使用后端返回的 message，兜底使用 ErrorCodeMap
 * @param {number} code - 后端错误码
 * @param {string} [serverMsg] - 后端返回的 message
 * @returns {string}
 */
export function getErrorMsg(code, serverMsg) {
  if (serverMsg) return serverMsg
  return ErrorCodeMap[code] || '操作失败，请稍后重试'
}

/**
 * 判断是否为认证类错误（需跳转登录页）
 * @param {number} code - 后端错误码
 * @returns {boolean}
 */
export function isAuthError(code) {
  return AUTH_ERROR_CODES.includes(code)
}

/**
 * 全局运行时异常捕获
 * 在 main.js 中调用：setupGlobalErrorHandler(app)
 * @param {App} app - Vue 应用实例
 */
export function setupGlobalErrorHandler(app) {
  // Vue 组件内的未捕获异常
  app.config.errorHandler = (err) => {
    console.error('[全局异常]', err)
    showErrorToast(BizError.SYSTEM_ERROR)
  }

  // 未捕获的 Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    // 忽略路由导航中断（正常业务流程，不是异常）
    if (event.reason?.name === 'NavigationDuplicated') return
    console.error('[未处理的Promise异常]', event.reason)
    showErrorToast(BizError.SYSTEM_ERROR)
  })
}
