import { request } from '@/utils/request';

/**
 * 获取报销单列表
 * @param {Object} params
 * @returns {Promise}
 */
export function getExpenses(params = {}) {
  return request.get({
    url: '/v1/expenses',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取报销单详情
 * @param {number} id
 * @returns {Promise}
 */
export function getExpense(id) {
  return request.get({
    url: `/v1/expenses/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建报销单
 * @param {Object} data
 * @returns {Promise}
 */
export function createExpense(data) {
  return request.post({
    url: '/v1/expenses',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新报销单
 * @param {number} id
 * @param {Object} data
 * @returns {Promise}
 */
export function updateExpense(id, data) {
  return request.put({
    url: `/v1/expenses/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 提交报销单
 * @param {number} id
 * @returns {Promise}
 */
export function submitExpense(id) {
  return request.post({
    url: `/v1/expenses/${id}/submit`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 审批报销单
 * @param {number} id
 * @returns {Promise}
 */
export function approveExpense(id) {
  return request.post({
    url: `/v1/expenses/${id}/approve`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除报销单
 * @param {number} id
 * @returns {Promise}
 */
export function deleteExpense(id) {
  return request.delete({
    url: `/v1/expenses/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}
