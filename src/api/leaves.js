import { request } from '@/utils/request';

/**
 * 获取请假申请列表
 * @param {Object} params
 * @returns {Promise}
 */
export function getLeaves(params = {}) {
  return request.get({
    url: '/v1/leaves',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取待审批请假
 * @returns {Promise}
 */
export function getPendingLeaves() {
  return request.get({
    url: '/v1/leaves/pending',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取请假详情
 * @param {number} id
 * @returns {Promise}
 */
export function getLeave(id) {
  return request.get({
    url: `/v1/leaves/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建请假申请
 * @param {Object} data
 * @returns {Promise}
 */
export function createLeave(data) {
  return request.post({
    url: '/v1/leaves',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新请假申请
 * @param {number} id
 * @param {Object} data
 * @returns {Promise}
 */
export function updateLeave(id, data) {
  return request.put({
    url: `/v1/leaves/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 审批请假申请
 * @param {number} id
 * @param {Object} data
 * @returns {Promise}
 */
export function approveLeave(id, data) {
  return request.post({
    url: `/v1/leaves/${id}/approve`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除请假申请
 * @param {number} id
 * @returns {Promise}
 */
export function deleteLeave(id) {
  return request.delete({
    url: `/v1/leaves/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}
