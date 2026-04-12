import { Toast, Dialog } from 'tdesign-mobile-vue';

/**
 * toast提示封装
 * @param {string} msg - 提示内容
 * @param {number} duration - 显示时间(毫秒)
 * @param {boolean} isOperability - 是否可操作
 */
export function showToast(msg, duration = 3000, isOperability = true) {
  Toast({
    message: msg,
    duration,
    preventScrollThrough: !isOperability,
    showOverlay: !isOperability
  });
}

/**
 * 清除toast
 */
export function toastClear() {
  Toast.clear();
}

/**
 * 成功toast提示
 * @param {string} msg - 提示内容
 * @param {number} duration - 显示时间(毫秒)
 * @param {boolean} isOperability - 是否可操作
 */
export function showSuccessToast(msg, duration = 3000, isOperability = true) {
  Toast({
    theme: 'success',
    message: msg,
    direction: 'column',
    duration,
    preventScrollThrough: !isOperability,
    showOverlay: !isOperability
  });
}

/**
 * 错误toast提示
 * @param {string} msg - 提示内容
 * @param {number} duration - 显示时间(毫秒)
 * @param {boolean} isOperability - 是否可操作
 */
export function showErrorToast(msg, duration = 3000, isOperability = true) {
  Toast({
    theme: 'error',
    message: msg,
    direction: 'column',
    duration,
    preventScrollThrough: !isOperability,
    showOverlay: !isOperability
  });
}

/**
 * 错误提示确认弹窗封装
 * @param {string} msg - 提示内容
 * @returns {Promise}
 */
export function showErrorDialog(msg) {
  return new Promise((resolve) => {
    Dialog.confirm({
      title: '提示',
      content: msg,
      confirmBtn: '确认',
      zIndex: 910001,
      overlayProps: {
        zIndex: 890501,
      },
      onConfirm() {
        resolve()
      },
    });
  })
}

/**
 * 确认弹窗封装
 * @param {Object} options - 弹窗配置
 * @returns {Promise}
 */
export function showConfirmDialog({
  title = "提示",
  content = "内容",
  confirmBtn = "确定",
  cancelBtn = "取消"
} = {}) {
  return new Promise((resolve, reject) => {
    Dialog.confirm({
      title: title,
      content: content,
      buttonLayout: "vertical",
      destroyOnClose: true,
      confirmBtn: confirmBtn ? { content: confirmBtn, theme: 'primary' } : null,
      cancelBtn: cancelBtn ? { content: cancelBtn, variant: "text", block: true } : null,
      overlayProps: {
        zIndex: 899995
      },
      onConfirm() {
        resolve()
      },
      onCancel() {
        reject()
      },
      zIndex: 900000
    });
  })
}

/**
 * 判断是否为空
 * @param {any} value - 要判断的值
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }
  return false;
}

/**
 * 判断是否不为空
 * @param {any} value - 要判断的值
 * @returns {boolean}
 */
export function notEmpty(value) {
  return !isEmpty(value);
}

/**
 * 获取上一个路由的信息
 * @returns {Object} 上一个路由信息
 */
export function getPreviousRoute() {
  const permissionStore = getPermissionStore();
  return permissionStore.previousRoute;
}

/**
 * 震动反馈
 * @param {number} duration - 震动时长(毫秒)，默认50ms
 */
export function vibrate(duration = 50) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(duration);
  }
}

/**
 * 震动反馈模式
 */
export const VIBRATE_PATTERNS = {
  short: 30,      // 短震动，用于普通点击反馈
  normal: 50,     // 标准震动，用于操作成功
  long: 100,      // 长震动，用于重要提醒
  success: [30, 50, 30],  // 成功模式：震动-停顿-震动
  error: [100, 50, 100]   // 错误模式：长震-停顿-长震
}

/**
 * 带设置的震动反馈
 * @param {number|number[]} pattern - 震动模式
 */
export function vibrateWithSettings(pattern = 50) {
  // 动态导入避免循环依赖
  import('@/store').then(({ useSettingsStore }) => {
    const settingsStore = useSettingsStore();
    if (settingsStore.vibration && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  });
}