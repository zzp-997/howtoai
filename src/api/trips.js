import { request } from '@/utils/request';

/**
 * 获取差旅申请列表
 * @param {Object} params
 * @returns {Promise}
 */
export function getTrips(params = {}) {
  return request.get({
    url: '/v1/trips',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取待审批差旅
 * @returns {Promise}
 */
export function getPendingTrips() {
  return request.get({
    url: '/v1/trips/pending',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取差旅详情
 * @param {number} id
 * @returns {Promise}
 */
export function getTrip(id) {
  return request.get({
    url: `/v1/trips/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建差旅申请
 * @param {Object} data
 * @returns {Promise}
 */
export function createTrip(data) {
  return request.post({
    url: '/v1/trips',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新差旅申请
 * @param {number} id
 * @param {Object} data
 * @returns {Promise}
 */
export function updateTrip(id, data) {
  return request.put({
    url: `/v1/trips/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 审批差旅申请
 * @param {number} id
 * @param {Object} data
 * @returns {Promise}
 */
export function approveTrip(id, data) {
  return request.post({
    url: `/v1/trips/${id}/approve`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除差旅申请
 * @param {number} id
 * @returns {Promise}
 */
export function deleteTrip(id) {
  return request.delete({
    url: `/v1/trips/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}
