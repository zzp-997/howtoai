import { request } from '@/utils/request';

/**
 * 获取考勤记录
 * @param {Object} params
 * @returns {Promise}
 */
export function getAttendances(params = {}) {
  return request.get({
    url: '/v1/attendance',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取今日考勤
 * @returns {Promise}
 */
export function getTodayAttendance() {
  return request.get({
    url: '/v1/attendance/today',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 上班打卡
 * @returns {Promise}
 */
export function checkIn() {
  return request.post({
    url: '/v1/attendance/check-in',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 下班打卡
 * @returns {Promise}
 */
export function checkOut() {
  return request.post({
    url: '/v1/attendance/check-out',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取考勤统计
 * @param {Object} params
 * @returns {Promise}
 */
export function getAttendanceStats(params = {}) {
  return request.get({
    url: '/v1/attendance/stats',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取补卡申请列表
 * @returns {Promise}
 */
export function getMakeUpRequests() {
  return request.get({
    url: '/v1/attendance/makeup-requests',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建补卡申请
 * @param {Object} data
 * @returns {Promise}
 */
export function createMakeUpRequest(data) {
  return request.post({
    url: '/v1/attendance/makeup-requests',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 审批补卡申请
 * @param {number} id
 * @param {boolean} approved
 * @returns {Promise}
 */
export function approveMakeUpRequest(id, approved) {
  return request.post({
    url: `/v1/attendance/makeup-requests/${id}/approve`,
    data: { approved },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}
