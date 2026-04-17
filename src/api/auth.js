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
