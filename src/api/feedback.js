import { request } from '@/utils/request';

/**
 * 反馈状态枚举
 * pending: 待处理
 * processing: 处理中
 * replied: 已回复
 * closed: 已关闭
 */
export const FEEDBACK_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  REPLIED: 'replied',
  CLOSED: 'closed'
};

/**
 * 反馈状态文本映射
 */
export const FEEDBACK_STATUS_TEXT = {
  [FEEDBACK_STATUS.PENDING]: '待处理',
  [FEEDBACK_STATUS.PROCESSING]: '处理中',
  [FEEDBACK_STATUS.REPLIED]: '已回复',
  [FEEDBACK_STATUS.CLOSED]: '已关闭'
};

/**
 * 反馈类型枚举
 */
export const FEEDBACK_TYPE = {
  SUGGESTION: '功能建议',
  BUG: '问题反馈',
  OTHER: '其他'
};

/**
 * 获取我的反馈列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.status - 状态筛选（pending/processing/replied/closed）
 * @param {string} params.type - 类型筛选（功能建议/问题反馈/其他）
 * @returns {Promise}
 */
export function getMyFeedbacks(params) {
  return request.get({
    url: '/v1/feedbacks',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取反馈详情
 * @param {string|number} id - 反馈ID
 * @returns {Promise}
 */
export function getFeedbackDetail(id) {
  return request.get({
    url: `/v1/feedbacks/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 提交反馈
 * @param {Object} data - 反馈数据
 * @param {string} data.type - 反馈类型（功能建议/问题反馈/其他）
 * @param {string} data.title - 标题
 * @param {string} data.content - 内容
 * @param {Array<string>} data.images - 图片URL数组（JSON）
 * @returns {Promise}
 */
export function submitFeedback(data) {
  return request.post({
    url: '/v1/feedbacks',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取反馈回复列表
 * @param {string|number} feedbackId - 反馈ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export function getFeedbackReplies(feedbackId, params) {
  return request.get({
    url: `/v1/feedbacks/${feedbackId}/replies`,
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 添加回复（用户/管理员）
 * @param {string|number} feedbackId - 反馈ID
 * @param {Object} data - 回复数据
 * @param {string} data.content - 回复内容
 * @returns {Promise}
 */
export function replyFeedback(feedbackId, data) {
  return request.post({
    url: `/v1/feedbacks/${feedbackId}/replies`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新反馈状态（管理员）
 * @param {string|number} id - 反馈ID
 * @param {string} status - 新状态（pending/processing/replied/closed）
 * @returns {Promise}
 */
export function updateFeedbackStatus(id, status) {
  return request.patch({
    url: `/v1/feedbacks/${id}/status`,
    data: { status },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除反馈
 * @param {string|number} id - 反馈ID
 * @returns {Promise}
 */
export function deleteFeedback(id) {
  return request.delete({
    url: `/v1/feedbacks/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取反馈统计数据
 * @returns {Promise}
 */
export function getFeedbackStats() {
  return request.get({
    url: '/v1/feedbacks/stats',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}