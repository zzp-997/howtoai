import { request } from '@/utils/request';

/**
 * 登录
 * @param {Object} data - 登录参数
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {number} data.loginType - 登录类型
 * @returns {Promise}
 */
export function login(data) {
  return request.post({
    url: '/v1/auth/login',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 登出
 * @returns {Promise}
 */
export function logout() {
  return request.post({
    url: '/v1/auth/logout',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
  return request.get({
    url: '/v1/auth/me',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * Token刷新
 * @param {string} refreshToken - 刷新令牌
 * @returns {Promise}
 */
export function refreshToken(refreshToken) {
  return request.post({
    url: '/v1/auth/refresh',
    data: { refreshToken },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 修改密码
 * @param {Object} data - 密码修改参数
 * @param {string} data.oldPassword - 旧密码
 * @param {string} data.newPassword - 新密码
 * @returns {Promise}
 */
export function changePassword(data) {
  return request.post({
    url: '/v1/auth/password/change',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 密码强度预校验
 * @param {string} password - 待校验的密码
 * @returns {Promise}
 */
export function validatePasswordStrength(password) {
  return request.post({
    url: '/v1/auth/password/validate',
    data: { password },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取密码过期状态
 * @returns {Promise}
 */
export function getPasswordExpiry() {
  return request.get({
    url: '/v1/auth/password/expiry',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取密码建议
 * @returns {Promise}
 */
export function getPasswordSuggestions() {
  return request.get({
    url: '/v1/auth/password/suggestions',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}
