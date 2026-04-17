import { request } from '@/utils/request';

/**
 * 获取考勤配置
 * @returns {Promise}
 */
export function getAttendanceConfigs() {
  return request.get({
    url: '/v1/configs/attendance',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 设置考勤配置
 * @param {Object} data
 * @returns {Promise}
 */
export function setAttendanceConfig(data) {
  return request.post({
    url: '/v1/configs/attendance',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取用户偏好
 * @returns {Promise}
 */
export function getUserPreference() {
  return request.get({
    url: '/v1/configs/user-preference',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新用户偏好
 * @param {Object} data
 * @returns {Promise}
 */
export function updateUserPreference(data) {
  return request.put({
    url: '/v1/configs/user-preference',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取出差模板列表
 * @returns {Promise}
 */
export function getTripTemplates() {
  return request.get({
    url: '/v1/configs/trip-templates',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建出差模板
 * @param {Object} data
 * @returns {Promise}
 */
export function createTripTemplate(data) {
  return request.post({
    url: '/v1/configs/trip-templates',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新出差模板
 * @param {number} id
 * @param {Object} data
 * @returns {Promise}
 */
export function updateTripTemplate(id, data) {
  return request.put({
    url: `/v1/configs/trip-templates/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除出差模板
 * @param {number} id
 * @returns {Promise}
 */
export function deleteTripTemplate(id) {
  return request.delete({
    url: `/v1/configs/trip-templates/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取城市配置列表
 * @param {Object} params
 * @returns {Promise}
 */
export function getCityConfigs(params = {}) {
  return request.get({
    url: '/v1/configs/cities',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取城市配置详情
 * @param {number} id
 * @returns {Promise}
 */
export function getCityConfig(id) {
  return request.get({
    url: `/v1/configs/cities/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建城市配置
 * @param {Object} data
 * @returns {Promise}
 */
export function createCityConfig(data) {
  return request.post({
    url: '/v1/configs/cities',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新城市配置
 * @param {number} id
 * @param {Object} data
 * @returns {Promise}
 */
export function updateCityConfig(id, data) {
  return request.put({
    url: `/v1/configs/cities/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除城市配置
 * @param {number} id
 * @returns {Promise}
 */
export function deleteCityConfig(id) {
  return request.delete({
    url: `/v1/configs/cities/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取节假日配置列表
 * @param {Object} params
 * @returns {Promise}
 */
export function getHolidayConfigs(params = {}) {
  return request.get({
    url: '/v1/configs/holidays',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 检查是否为工作日
 * @param {string} date YYYY-MM-DD
 * @returns {Promise}
 */
export function checkWorkday(date) {
  return request.get({
    url: '/v1/configs/holidays/check',
    params: { date },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建节假日配置
 * @param {Object} data
 * @returns {Promise}
 */
export function createHolidayConfig(data) {
  return request.post({
    url: '/v1/configs/holidays',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新节假日配置
 * @param {number} id
 * @param {Object} data
 * @returns {Promise}
 */
export function updateHolidayConfig(id, data) {
  return request.put({
    url: `/v1/configs/holidays/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除节假日配置
 * @param {number} id
 * @returns {Promise}
 */
export function deleteHolidayConfig(id) {
  return request.delete({
    url: `/v1/configs/holidays/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}
