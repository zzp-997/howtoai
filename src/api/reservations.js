import { request } from '@/utils/request';

/**
 * 获取预定列表
 * @param {Object} params
 * @returns {Promise}
 */
export function getReservations(params = {}) {
  return request.get({
    url: '/v1/reservations',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取我的预定
 * @returns {Promise}
 */
export function getMyReservations() {
  return request.get({
    url: '/v1/reservations/my',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建预定
 * @param {Object} data
 * @returns {Promise}
 */
export function createReservation(data) {
  return request.post({
    url: '/v1/reservations',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 检查预定冲突
 * @param {Object} data
 * @returns {Promise}
 */
export function checkReservationConflict(data) {
  return request.post({
    url: '/v1/reservations/check-conflict',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新预定
 * @param {number} id
 * @param {Object} data
 * @returns {Promise}
 */
export function updateReservation(id, data) {
  return request.put({
    url: `/v1/reservations/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 取消预定
 * @param {number} id
 * @returns {Promise}
 */
export function cancelReservation(id) {
  return request.delete({
    url: `/v1/reservations/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}
