import { request } from '@/utils/request';

/**
 * 获取会议室列表
 * @param {Object} params
 * @returns {Promise}
 */
export function getMeetingRooms(params = {}) {
  return request.get({
    url: '/v1/meeting-rooms',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取会议室详情
 * @param {number} id
 * @returns {Promise}
 */
export function getMeetingRoom(id) {
  return request.get({
    url: `/v1/meeting-rooms/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建会议室
 * @param {Object} data
 * @returns {Promise}
 */
export function createMeetingRoom(data) {
  return request.post({
    url: '/v1/meeting-rooms',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新会议室
 * @param {number} id
 * @param {Object} data
 * @returns {Promise}
 */
export function updateMeetingRoom(id, data) {
  return request.put({
    url: `/v1/meeting-rooms/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除会议室
 * @param {number} id
 * @returns {Promise}
 */
export function deleteMeetingRoom(id) {
  return request.delete({
    url: `/v1/meeting-rooms/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}
