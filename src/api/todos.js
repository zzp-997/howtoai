import { request } from '@/utils/request';

/**
 * 获取待办列表
 * @param {Object} params
 * @returns {Promise}
 */
export function getTodos(params = {}) {
  return request.get({
    url: '/v1/todos',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取即将到期待办
 * @returns {Promise}
 */
export function getUpcomingTodos() {
  return request.get({
    url: '/v1/todos/upcoming',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取未完成待办数量
 * @returns {Promise}
 */
export function getTodoCount() {
  return request.get({
    url: '/v1/todos/count',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建待办
 * @param {Object} data
 * @returns {Promise}
 */
export function createTodo(data) {
  return request.post({
    url: '/v1/todos',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新待办
 * @param {number} id
 * @param {Object} data
 * @returns {Promise}
 */
export function updateTodo(id, data) {
  return request.put({
    url: `/v1/todos/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 切换待办完成状态
 * @param {number} id
 * @returns {Promise}
 */
export function toggleTodo(id) {
  return request.post({
    url: `/v1/todos/${id}/toggle`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除待办
 * @param {number} id
 * @returns {Promise}
 */
export function deleteTodo(id) {
  return request.delete({
    url: `/v1/todos/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}
