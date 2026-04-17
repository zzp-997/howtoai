import { request } from '@/utils/request';

/**
 * 获取用户列表
 * @returns {Promise}
 */
export function getUsers() {
  return request.get({
    url: '/v1/users',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取用户详情
 * @param {number} id
 * @returns {Promise}
 */
export function getUser(id) {
  return request.get({
    url: `/v1/users/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新用户信息
 * @param {number} id
 * @param {Object} data
 * @returns {Promise}
 */
export function updateUser(id, data) {
  return request.put({
    url: `/v1/users/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}
