/**
 * 会议智能调度 API模块
 * 对应后端接口:
 * - /api/v1/reservations/* - 会议预定
 * 注意：会议室基础接口已在 meeting-rooms.js 中定义
 */
import { request } from '@/utils/request';

// ==================== 会议预定接口 ====================

/**
 * 智能推荐会议室
 * @param {Object} data - 推荐参数
 * @param {number} data.capacity - 参会人数
 * @param {string} data.startTime - 开始时间
 * @param {string} data.endTime - 结束时间
 * @param {Array<string>} data.equipment - 需要的设备
 * @returns {Promise}
 */
export function recommendMeetingRooms(data) {
  // 后端暂无智能推荐接口，暂用会议室列表代替
  return request.get({
    url: '/v1/meeting-rooms',
    params: { min_capacity: data.capacity },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 查询可用时段
 * @param {Object} params - 查询参数
 * @param {number} params.roomId - 会议室ID
 * @param {string} params.date - 日期
 * @returns {Promise}
 */
export function getAvailableSlots(params = {}) {
  // 后端暂无可用时段查询接口
  return request.get({
    url: '/v1/reservations',
    params: { room_id: params.roomId },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 检测会议室冲突
 * @param {Object} data - 冲突检测参数
 * @param {number} data.roomId - 会议室ID
 * @param {string} data.startTime - 开始时间
 * @param {string} data.endTime - 结束时间
 * @returns {Promise}
 */
export function checkConflict(data) {
  return request.post({
    url: '/v1/reservations/check-conflict',
    data: {
      room_id: data.roomId,
      start_time: data.startTime,
      end_time: data.endTime,
    },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建会议预约
 * @param {Object} data - 预定数据
 * @returns {Promise}
 */
export function createMeeting(data) {
  return request.post({
    url: '/v1/reservations',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取我的会议列表
 * @param {Object} params - 查询参数
 * @param {number} params.roomId - 会议室ID（可选）
 * @returns {Promise}
 */
export function getMyMeetings(params = {}) {
  return request.get({
    url: '/v1/reservations/my',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取会议详情
 * @param {number} id - 预定ID
 * @returns {Promise}
 */
export function getMeetingDetail(id) {
  return request.get({
    url: `/v1/reservations/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新会议预约
 * @param {number} id - 预定ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updateMeeting(id, data) {
  return request.put({
    url: `/v1/reservations/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 取消会议预约
 * @param {number} id - 预定ID
 * @returns {Promise}
 */
export function cancelMeeting(id) {
  return request.delete({
    url: `/v1/reservations/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取会议室使用情况（日视图）
 * @param {Object} params - 查询参数
 * @param {number} params.roomId - 会议室ID
 * @param {string} params.date - 日期
 * @returns {Promise}
 */
export function getRoomDayView(params = {}) {
  return request.get({
    url: '/v1/reservations',
    params: { room_id: params.roomId },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取会议室使用情况（周视图）
 * @param {Object} params - 查询参数
 * @param {number} params.roomId - 会议室ID
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export function getRoomWeekView(params = {}) {
  return request.get({
    url: '/v1/reservations',
    params: { room_id: params.roomId },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

export default {
  // 智能调度
  recommendMeetingRooms,
  getAvailableSlots,
  checkConflict,
  // 会议预定
  createMeeting,
  getMyMeetings,
  getMeetingDetail,
  updateMeeting,
  cancelMeeting,
  // 使用情况
  getRoomDayView,
  getRoomWeekView,
};
