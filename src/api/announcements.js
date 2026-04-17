import { request } from '@/utils/request';

/**
 * 获取公告列表
 * @param {Object} params
 * @returns {Promise}
 */
export function getAnnouncements(params = {}) {
  return request.get({
    url: '/v1/announcements',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取未读公告
 * @returns {Promise}
 */
export function getUnreadAnnouncements() {
  return request.get({
    url: '/v1/announcements/unread',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取未读公告数量
 * @returns {Promise}
 */
export function getUnreadAnnouncementCount() {
  return request.get({
    url: '/v1/announcements/unread-count',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取公告详情
 * @param {number} id
 * @returns {Promise}
 */
export function getAnnouncement(id) {
  return request.get({
    url: `/v1/announcements/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 标记公告已读
 * @param {number} id
 * @returns {Promise}
 */
export function markAnnouncementRead(id) {
  return request.post({
    url: `/v1/announcements/${id}/read`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建公告
 * @param {Object} data
 * @returns {Promise}
 */
export function createAnnouncement(data) {
  return request.post({
    url: '/v1/announcements',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新公告
 * @param {number} id
 * @param {Object} data
 * @returns {Promise}
 */
export function updateAnnouncement(id, data) {
  return request.put({
    url: `/v1/announcements/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除公告
 * @param {number} id
 * @returns {Promise}
 */
export function deleteAnnouncement(id) {
  return request.delete({
    url: `/v1/announcements/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}
