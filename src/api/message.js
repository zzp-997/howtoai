/**
 * 消息中心API模块
 * 对应后端接口: /api/v1/messages/*
 *
 * 消息类型：
 * - approval：审批通知（申请提交、审批通过、审批拒绝、催办提醒）
 * - system：系统通知（公告发布、密码过期提醒）
 * - task：任务通知（任务分配、任务评论、任务截止提醒）
 */

import { request } from '@/utils/request';

/**
 * 获取消息列表
 * @param {Object} params - 查询参数
 * @param {string} params.type - 消息类型（approval/system/task）
 * @param {boolean} params.is_read - 是否已读
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @returns {Promise}
 */
export function getMessages(params) {
  return request.get({
    url: '/v1/messages',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false,
  });
}

/**
 * 获取未读消息数
 * @returns {Promise}
 */
export function getUnreadCount() {
  return request.get({
    url: '/v1/messages/unread-count',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false,
  });
}

/**
 * 标记单条消息已读
 * @param {number|string} id - 消息ID
 * @returns {Promise}
 */
export function markMessageRead(id) {
  return request.post({
    url: `/v1/messages/${id}/read`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false,
  });
}

/**
 * 批量标记已读
 * @param {string} type - 消息类型（可选，不传则标记全部类型）
 * @returns {Promise}
 */
export function markAllRead(type) {
  return request.post({
    url: '/v1/messages/read-all',
    data: type ? { type } : {},
  }, {
    isJoinPrefix: true,
    isTransformResponse: false,
  });
}

/**
 * 批量标记指定消息已读
 * @param {Array<number|string>} ids - 消息ID数组
 * @returns {Promise}
 */
export function batchMarkRead(ids) {
  return request.post({
    url: '/v1/messages/read',
    data: { ids },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false,
  });
}

/**
 * 删除单条消息
 * @param {number|string} id - 消息ID
 * @returns {Promise}
 */
export function deleteMessage(id) {
  return request.delete({
    url: `/v1/messages/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false,
  });
}

/**
 * 获取消息详情
 * @param {number|string} id - 消息ID
 * @returns {Promise}
 */
export function getMessageDetail(id) {
  return request.get({
    url: `/v1/messages/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false,
  });
}

// ==================== 模拟数据生成器（开发环境使用） ====================

/**
 * 模拟请求函数（用于本地开发测试）
 * @param {Object} config - 请求配置
 * @returns {Promise}
 */
function mockRequest(config) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: generateMockData(config) });
    }, 300);
  });
}

/**
 * 根据请求配置生成模拟数据
 * @param {Object} config - 请求配置
 * @returns {Object} 模拟数据
 */
function generateMockData(config) {
  const { url, method, params, data } = config;

  // 获取消息列表
  if (url.includes('/messages') && method === 'get' && !url.includes('unread-count') && !url.includes('/messages/')) {
    return mockMessagesList(params);
  }

  // 获取未读消息数
  if (url.includes('unread-count')) {
    return mockUnreadCount();
  }

  // 标记单条消息已读
  if (url.match(/\/messages\/(\d+)\/read/) && method === 'post') {
    return mockMarkRead(url);
  }

  // 批量标记已读
  if (url.includes('/messages/read-all') && method === 'post') {
    return mockMarkAllRead(data?.type);
  }

  // 批量标记指定消息已读
  if (url.includes('/messages/read') && method === 'post' && data?.ids) {
    return mockBatchMarkRead(data.ids);
  }

  // 获取消息详情
  if (url.match(/\/messages\/(\d+)$/) && method === 'get') {
    return mockMessageDetail(url);
  }

  // 删除消息
  if (url.match(/\/messages\/(\d+)$/) && method === 'delete') {
    return mockDeleteMessage(url);
  }

  return { code: 404, message: '接口不存在', data: null };
}

// ==================== 模拟数据存储 ====================

// 模拟消息数据（用于本地开发测试）
const mockMessagesData = [
  {
    id: 1,
    type: 'approval',
    title: '差旅申请审批通知',
    content: '张三提交了差旅申请，金额为5000元，请尽快审批。',
    link: '/approval/trip/1',
    isRead: false,
    createdAt: '2026-04-30T10:00:00Z',
    relatedId: 1,
    relatedType: 'trip',
  },
  {
    id: 2,
    type: 'approval',
    title: '审批通过通知',
    content: '您的请假申请已通过审批，请假天数：3天。',
    link: '/approval/leave/2',
    isRead: false,
    createdAt: '2026-04-30T09:30:00Z',
    relatedId: 2,
    relatedType: 'leave',
  },
  {
    id: 3,
    type: 'approval',
    title: '审批拒绝通知',
    content: '您的差旅申请被拒绝，拒绝原因：预算超标。',
    link: '/approval/trip/3',
    isRead: true,
    createdAt: '2026-04-29T14:00:00Z',
    relatedId: 3,
    relatedType: 'trip',
  },
  {
    id: 4,
    type: 'approval',
    title: '催办提醒',
    content: '申请人催促您尽快审批差旅申请。',
    link: '/approval/trip/1',
    isRead: false,
    createdAt: '2026-04-30T11:00:00Z',
    relatedId: 1,
    relatedType: 'trip',
  },
  {
    id: 5,
    type: 'system',
    title: '系统公告',
    content: '五一劳动节放假通知：5月1日至5月5日放假，共5天。',
    link: '/announcement/1',
    isRead: false,
    createdAt: '2026-04-30T08:00:00Z',
    relatedId: null,
    relatedType: null,
  },
  {
    id: 6,
    type: 'system',
    title: '密码过期提醒',
    content: '您的密码将在3天后过期，请及时修改密码。',
    link: '/settings/password',
    isRead: true,
    createdAt: '2026-04-28T10:00:00Z',
    relatedId: null,
    relatedType: null,
  },
  {
    id: 7,
    type: 'task',
    title: '任务分配通知',
    content: '您被分配了新任务：完成周报编写，截止日期：2026-05-05。',
    link: '/task/1',
    isRead: false,
    createdAt: '2026-04-30T09:00:00Z',
    relatedId: 1,
    relatedType: 'task',
  },
  {
    id: 8,
    type: 'task',
    title: '任务评论通知',
    content: '李四在任务"周报编写"下评论：请补充本周数据分析内容。',
    link: '/task/1#comment',
    isRead: false,
    createdAt: '2026-04-30T10:30:00Z',
    relatedId: 1,
    relatedType: 'task',
  },
  {
    id: 9,
    type: 'task',
    title: '任务截止提醒',
    content: '任务"周报编写"将在明天截止，请及时完成。',
    link: '/task/1',
    isRead: false,
    createdAt: '2026-04-29T16:00:00Z',
    relatedId: 1,
    relatedType: 'task',
  },
  {
    id: 10,
    type: 'approval',
    title: '报销申请审批通知',
    content: '王五提交了办公用品报销申请，金额为1500元。',
    link: '/approval/expense/4',
    isRead: true,
    createdAt: '2026-04-28T11:00:00Z',
    relatedId: 4,
    relatedType: 'expense',
  },
];

// ==================== 模拟数据生成函数 ====================

/**
 * 模拟消息列表数据
 * @param {Object} params - 查询参数
 * @returns {Object} 模拟响应数据
 */
function mockMessagesList(params) {
  const { type, is_read, page = 1, size = 20 } = params || {};

  let filtered = [...mockMessagesData];

  // 按类型筛选
  if (type) {
    filtered = filtered.filter((msg) => msg.type === type);
  }

  // 按是否已读筛选
  if (is_read !== undefined) {
    const readStatus = is_read === 'true' || is_read === true;
    filtered = filtered.filter((msg) => msg.isRead === readStatus);
  }

  const total = filtered.length;
  const pageNum = parseInt(page) || 1;
  const pageSize = parseInt(size) || 20;
  const list = filtered.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  return {
    code: 200,
    message: '获取成功',
    data: {
      list,
      total,
      page: pageNum,
      size: pageSize,
    },
  };
}

/**
 * 模拟未读消息数数据
 * @returns {Object} 模拟响应数据
 */
function mockUnreadCount() {
  const approvalUnread = mockMessagesData.filter(
    (msg) => msg.type === 'approval' && !msg.isRead
  ).length;
  const systemUnread = mockMessagesData.filter(
    (msg) => msg.type === 'system' && !msg.isRead
  ).length;
  const taskUnread = mockMessagesData.filter(
    (msg) => msg.type === 'task' && !msg.isRead
  ).length;
  const totalUnread = mockMessagesData.filter((msg) => !msg.isRead).length;

  return {
    code: 200,
    message: '获取成功',
    data: {
      total: totalUnread,
      approval: approvalUnread,
      system: systemUnread,
      task: taskUnread,
    },
  };
}

/**
 * 模拟标记单条消息已读
 * @param {string} url - 请求URL
 * @returns {Object} 模拟响应数据
 */
function mockMarkRead(url) {
  const match = url.match(/\/messages\/(\d+)\/read/);
  if (!match) {
    return { code: 400, message: '无效的消息ID', data: null };
  }

  const id = parseInt(match[1]);
  const message = mockMessagesData.find((msg) => msg.id === id);

  if (!message) {
    return { code: 404, message: '消息不存在', data: null };
  }

  message.isRead = true;

  return {
    code: 200,
    message: '标记已读成功',
    data: null,
  };
}

/**
 * 模拟批量标记全部已读
 * @param {string} type - 消息类型（可选）
 * @returns {Object} 模拟响应数据
 */
function mockMarkAllRead(type) {
  let count = 0;

  mockMessagesData.forEach((msg) => {
    if (!msg.isRead) {
      if (!type || msg.type === type) {
        msg.isRead = true;
        count++;
      }
    }
  });

  return {
    code: 200,
    message: `已标记${count}条消息为已读`,
    data: { count },
  };
}

/**
 * 模拟批量标记指定消息已读
 * @param {Array} ids - 消息ID数组
 * @returns {Object} 模拟响应数据
 */
function mockBatchMarkRead(ids) {
  let count = 0;

  ids.forEach((id) => {
    const message = mockMessagesData.find((msg) => msg.id === parseInt(id));
    if (message && !message.isRead) {
      message.isRead = true;
      count++;
    }
  });

  return {
    code: 200,
    message: `标记成功${count}条`,
    data: { count },
  };
}

/**
 * 模拟获取消息详情
 * @param {string} url - 请求URL
 * @returns {Object} 模拟响应数据
 */
function mockMessageDetail(url) {
  const match = url.match(/\/messages\/(\d+)$/);
  if (!match) {
    return { code: 400, message: '无效的消息ID', data: null };
  }

  const id = parseInt(match[1]);
  const message = mockMessagesData.find((msg) => msg.id === id);

  if (!message) {
    return { code: 404, message: '消息不存在', data: null };
  }

  return {
    code: 200,
    message: '获取成功',
    data: message,
  };
}

/**
 * 模拟删除消息
 * @param {string} url - 请求URL
 * @returns {Object} 模拟响应数据
 */
function mockDeleteMessage(url) {
  const match = url.match(/\/messages\/(\d+)$/);
  if (!match) {
    return { code: 400, message: '无效的消息ID', data: null };
  }

  const id = parseInt(match[1]);
  const index = mockMessagesData.findIndex((msg) => msg.id === id);

  if (index === -1) {
    return { code: 404, message: '消息不存在', data: null };
  }

  mockMessagesData.splice(index, 1);

  return {
    code: 200,
    message: '删除成功',
    data: null,
  };
}

// ==================== 开发环境导出模拟函数 ====================

// 如果需要本地测试，可以导出模拟请求函数
export const mockMessageApi = {
  getMessages: (params) => mockRequest({ url: '/v1/messages', method: 'get', params }),
  getUnreadCount: () => mockRequest({ url: '/v1/messages/unread-count', method: 'get' }),
  markMessageRead: (id) => mockRequest({ url: `/v1/messages/${id}/read`, method: 'post' }),
  markAllRead: (type) => mockRequest({ url: '/v1/messages/read-all', method: 'post', data: type ? { type } : {} }),
  batchMarkRead: (ids) => mockRequest({ url: '/v1/messages/read', method: 'post', data: { ids } }),
  getMessageDetail: (id) => mockRequest({ url: `/v1/messages/${id}`, method: 'get' }),
  deleteMessage: (id) => mockRequest({ url: `/v1/messages/${id}`, method: 'delete' }),
};