/**
 * 数据统计API模块
 * 对应后端接口: /api/v1/stats/*
 */
import { request } from '@/utils/request';

/**
 * 会议使用率统计
 * @param {Object} params - 查询参数
 * @param {string} params.period - 时间维度（day/week/month/quarter/year）
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export function getMeetingStats(params = {}) {
  return request.get({
    url: '/v1/stats/meetings',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 考勤分析统计
 * @param {Object} params - 查询参数
 * @param {string} params.period - 时间维度
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export function getAttendanceStats(params = {}) {
  return request.get({
    url: '/v1/stats/attendance',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 审批统计
 * @param {Object} params - 查询参数
 * @param {string} params.period - 时间维度
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export function getApprovalStats(params = {}) {
  return request.get({
    url: '/v1/stats/approvals',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 综合大屏数据
 * @returns {Promise}
 */
export function getDashboardStats() {
  return request.get({
    url: '/v1/stats/dashboard',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 导出报表
 * @param {Object} params - 导出参数
 * @param {string} params.type - 报表类型
 * @param {string} params.period - 时间维度
 * @param {string} params.format - 导出格式（xlsx/pdf）
 * @returns {Promise}
 */
export function exportReport(params = {}) {
  return request.post({
    url: '/v1/stats/export',
    data: params,
    responseType: 'blob'
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取用户个人统计
 * @returns {Promise}
 */
export function getMyStats() {
  return request.get({
    url: '/v1/stats/me',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

export default {
  getMeetingStats,
  getAttendanceStats,
  getApprovalStats,
  getDashboardStats,
  exportReport,
  getMyStats,
};