/**
 * 任务协作 API
 * 提供任务的完整 CRUD、子任务、评论、动态和分配功能
 */
import { request } from '@/utils/request';

// ==================== 枚举定义 ====================

/**
 * 任务状态枚举
 */
export const TASK_STATUS = {
  TODO: 'todo',           // 待处理
  IN_PROGRESS: 'in_progress', // 进行中
  DONE: 'done',           // 已完成
  CLOSED: 'closed'        // 已关闭
};

/**
 * 任务状态中文映射
 */
export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: '待处理',
  [TASK_STATUS.IN_PROGRESS]: '进行中',
  [TASK_STATUS.DONE]: '已完成',
  [TASK_STATUS.CLOSED]: '已关闭'
};

/**
 * 任务优先级枚举
 */
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

/**
 * 任务优先级中文映射
 */
export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: '低',
  [TASK_PRIORITY.MEDIUM]: '中',
  [TASK_PRIORITY.HIGH]: '高'
};

/**
 * 任务优先级配置（含样式）
 */
export const TASK_PRIORITY_CONFIG = {
  [TASK_PRIORITY.HIGH]: {
    label: '高',
    value: TASK_PRIORITY.HIGH,
    color: '#E34D59',
    bgClass: 'bg-[#FFEBEE]',
    textClass: 'text-[#E34D59]'
  },
  [TASK_PRIORITY.MEDIUM]: {
    label: '中',
    value: TASK_PRIORITY.MEDIUM,
    color: '#ED7B2F',
    bgClass: 'bg-[#FFF3E0]',
    textClass: 'text-[#ED7B2F]'
  },
  [TASK_PRIORITY.LOW]: {
    label: '低',
    value: TASK_PRIORITY.LOW,
    color: '#00A870',
    bgClass: 'bg-[#E8F5E9]',
    textClass: 'text-[#00A870]'
  }
};

/**
 * 任务状态配置（含样式）
 */
export const TASK_STATUS_CONFIG = {
  [TASK_STATUS.TODO]: {
    label: '待处理',
    value: TASK_STATUS.TODO,
    color: '#666666',
    bgClass: 'bg-[#f0f0f0]',
    textClass: 'text-[#666]'
  },
  [TASK_STATUS.IN_PROGRESS]: {
    label: '进行中',
    value: TASK_STATUS.IN_PROGRESS,
    color: '#0052D9',
    bgClass: 'bg-[#e8f4ff]',
    textClass: 'text-[#0052D9]'
  },
  [TASK_STATUS.DONE]: {
    label: '已完成',
    value: TASK_STATUS.DONE,
    color: '#00A870',
    bgClass: 'bg-[#e8f9f0]',
    textClass: 'text-[#00A870]'
  },
  [TASK_STATUS.CLOSED]: {
    label: '已关闭',
    value: TASK_STATUS.CLOSED,
    color: '#999999',
    bgClass: 'bg-[#f5f5f5]',
    textClass: 'text-[#999]'
  }
};

/**
 * 任务活动类型枚举
 */
export const TASK_ACTIVITY_TYPE = {
  CREATE: 'create',           // 创建任务
  UPDATE: 'update',           // 更新任务
  STATUS_CHANGE: 'status_change', // 状态变更
  ASSIGN: 'assign',           // 分配任务
  COMMENT: 'comment',         // 发表评论
  SUBTASK: 'subtask',         // 子任务操作
  WATCHER: 'watcher',         // 关注者变更
  DELETE: 'delete'            // 删除任务
};

/**
 * 任务活动类型中文映射
 */
export const TASK_ACTIVITY_TYPE_LABELS = {
  [TASK_ACTIVITY_TYPE.CREATE]: '创建了任务',
  [TASK_ACTIVITY_TYPE.UPDATE]: '更新了任务',
  [TASK_ACTIVITY_TYPE.STATUS_CHANGE]: '更新了状态',
  [TASK_ACTIVITY_TYPE.ASSIGN]: '分配了任务',
  [TASK_ACTIVITY_TYPE.COMMENT]: '发表了评论',
  [TASK_ACTIVITY_TYPE.SUBTASK]: '操作了子任务',
  [TASK_ACTIVITY_TYPE.WATCHER]: '更新了关注者',
  [TASK_ACTIVITY_TYPE.DELETE]: '删除了任务'
};

// ==================== 任务 CRUD 接口 ====================

/**
 * 获取任务列表（支持看板分组）
 * @param {Object} params - 查询参数
 * @param {string} params.status - 任务状态筛选
 * @param {number} params.assigneeId - 负责人ID筛选
 * @param {string} params.priority - 优先级筛选
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @returns {Promise}
 */
export function getTasks(params = {}) {
  return request.get({
    url: '/v1/tasks',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取任务详情
 * @param {number} id - 任务ID
 * @returns {Promise}
 */
export function getTaskById(id) {
  return request.get({
    url: `/v1/tasks/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取单个任务详情（别名）
 * @param {number} id - 任务ID
 * @returns {Promise}
 */
export function getTask(id) {
  return request.get({
    url: `/v1/tasks/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建任务（扩展字段）
 * @param {Object} data - 任务数据
 * @param {string} data.title - 任务标题（必填）
 * @param {string} data.description - 任务描述
 * @param {string} data.priority - 优先级（low/medium/high）
 * @param {number[]} data.assignees - 负责人ID数组
 * @param {number[]} data.watchers - 关注者ID数组
 * @param {string} data.dueDate - 截止日期（ISO格式）
 * @param {number} data.parentId - 父任务ID（用于创建子任务）
 * @param {Array} data.subtasks - 子任务列表
 * @returns {Promise}
 */
export function createTask(data) {
  return request.post({
    url: '/v1/tasks',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新任务
 * @param {number} id - 任务ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updateTask(id, data) {
  return request.put({
    url: `/v1/tasks/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新任务状态（拖拽用）
 * @param {number} id - 任务ID
 * @param {string} status - 新状态（todo/in_progress/done/closed）
 * @returns {Promise}
 */
export function updateTaskStatus(id, status) {
  return request.patch({
    url: `/v1/tasks/${id}/status`,
    data: { status },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除任务
 * @param {number} id - 任务ID
 * @returns {Promise}
 */
export function deleteTask(id) {
  return request.delete({
    url: `/v1/tasks/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 批量更新任务状态
 * @param {number[]} ids - 任务ID数组
 * @param {string} status - 新状态
 * @returns {Promise}
 */
export function batchUpdateTaskStatus(ids, status) {
  return request.post({
    url: '/v1/tasks/batch/status',
    data: { ids, status },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 批量删除任务
 * @param {number[]} ids - 任务ID数组
 * @returns {Promise}
 */
export function batchDeleteTasks(ids) {
  return request.post({
    url: '/v1/tasks/batch/delete',
    data: { ids },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

// ==================== 子任务接口 ====================

/**
 * 获取子任务列表
 * @param {number} taskId - 父任务ID
 * @returns {Promise}
 */
export function getSubtasks(taskId) {
  return request.get({
    url: `/v1/tasks/${taskId}/subtasks`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 添加子任务（别名，兼容旧接口）
 * @param {number} taskId - 父任务ID
 * @param {Object} data - 子任务数据
 * @param {string} data.title - 子任务标题（必填）
 * @param {number} data.assigneeId - 负责人ID
 * @returns {Promise}
 */
export function addSubtask(taskId, data) {
  return request.post({
    url: `/v1/tasks/${taskId}/subtasks`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建子任务
 * @param {number} taskId - 父任务ID
 * @param {Object} data - 子任务数据
 * @param {string} data.title - 子任务标题（必填）
 * @param {number} data.assigneeId - 负责人ID
 * @returns {Promise}
 */
export function createSubtask(taskId, data) {
  return request.post({
    url: `/v1/tasks/${taskId}/subtasks`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新子任务（完成/取消完成）
 * @param {number} taskId - 父任务ID
 * @param {number} subtaskId - 子任务ID
 * @param {Object} data - 更新数据
 * @param {string} data.title - 子任务标题
 * @param {boolean} data.completed - 是否完成
 * @param {number} data.assigneeId - 负责人ID
 * @returns {Promise}
 */
export function updateSubtask(taskId, subtaskId, data) {
  return request.put({
    url: `/v1/tasks/${taskId}/subtasks/${subtaskId}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除子任务
 * @param {number} taskId - 父任务ID
 * @param {number} subtaskId - 子任务ID
 * @returns {Promise}
 */
export function deleteSubtask(taskId, subtaskId) {
  return request.delete({
    url: `/v1/tasks/${taskId}/subtasks/${subtaskId}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 切换子任务完成状态
 * @param {number} taskId - 父任务ID
 * @param {number} subtaskId - 子任务ID
 * @returns {Promise}
 */
export function toggleSubtask(taskId, subtaskId) {
  return request.post({
    url: `/v1/tasks/${taskId}/subtasks/${subtaskId}/toggle`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

// ==================== 任务评论接口 ====================

/**
 * 获取评论列表
 * @param {number} taskId - 任务ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @returns {Promise}
 */
export function getTaskComments(taskId, params = {}) {
  return request.get({
    url: `/v1/tasks/${taskId}/comments`,
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 发表评论
 * @param {number} taskId - 任务ID
 * @param {Object} data - 评论数据
 * @param {string} data.content - 评论内容（必填）
 * @param {number[]} data.mentionUsers - @提及的用户ID数组
 * @returns {Promise}
 */
export function createTaskComment(taskId, data) {
  return request.post({
    url: `/v1/tasks/${taskId}/comments`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新评论
 * @param {number} taskId - 任务ID
 * @param {number} commentId - 评论ID
 * @param {Object} data - 更新数据
 * @param {string} data.content - 评论内容
 * @returns {Promise}
 */
export function updateTaskComment(taskId, commentId, data) {
  return request.put({
    url: `/v1/tasks/${taskId}/comments/${commentId}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除评论
 * @param {number} taskId - 任务ID
 * @param {number} commentId - 评论ID
 * @returns {Promise}
 */
export function deleteTaskComment(taskId, commentId) {
  return request.delete({
    url: `/v1/tasks/${taskId}/comments/${commentId}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

// ==================== 任务动态接口 ====================

/**
 * 获取任务动态列表
 * @param {number} taskId - 任务ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @returns {Promise}
 */
export function getTaskActivities(taskId, params = {}) {
  return request.get({
    url: `/v1/tasks/${taskId}/activities`,
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取我的任务动态（所有任务的综合动态）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @returns {Promise}
 */
export function getMyTaskActivities(params = {}) {
  return request.get({
    url: '/v1/tasks/activities/me',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

// ==================== 任务分配接口 ====================

/**
 * 分配任务给多人
 * @param {number} id - 任务ID
 * @param {Object} data - 分配数据
 * @param {number[]} data.assignees - 负责人ID数组
 * @returns {Promise}
 */
export function assignTask(id, data) {
  return request.post({
    url: `/v1/tasks/${id}/assign`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 添加/移除关注者
 * @param {number} id - 任务ID
 * @param {Object} data - 关注者数据
 * @param {number[]} data.add - 添加的关注者ID数组
 * @param {number[]} data.remove - 移除的关注者ID数组
 * @returns {Promise}
 */
export function updateWatchers(id, data) {
  return request.patch({
    url: `/v1/tasks/${id}/watchers`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 设置任务关注状态（当前用户）
 * @param {number} id - 任务ID
 * @param {boolean} watch - true=关注，false=取消关注
 * @returns {Promise}
 */
export function setTaskWatch(id, watch) {
  return request.post({
    url: `/v1/tasks/${id}/watch`,
    data: { watch },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

// ==================== 任务统计接口 ====================

/**
 * 获取任务统计概览
 * @returns {Promise}
 */
export function getTaskStats() {
  return request.get({
    url: '/v1/tasks/stats',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取看板统计数据
 * @returns {Promise}
 */
export function getKanbanStats() {
  return request.get({
    url: '/v1/tasks/kanban/stats',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取用户任务统计
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export function getUserTaskStats(userId) {
  return request.get({
    url: `/v1/tasks/stats/user/${userId}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

// ==================== 任务搜索接口 ====================

/**
 * 搜索任务
 * @param {Object} params - 搜索参数
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.status - 状态筛选
 * @param {string} params.priority - 优先级筛选
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @returns {Promise}
 */
export function searchTasks(params = {}) {
  return request.get({
    url: '/v1/tasks/search',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

// ==================== 导出所有接口 ====================

export default {
  // 枚举
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_CONFIG,
  TASK_ACTIVITY_TYPE,
  TASK_ACTIVITY_TYPE_LABELS,
  // 任务CRUD
  getTasks,
  getTaskById,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  batchUpdateTaskStatus,
  batchDeleteTasks,
  // 子任务
  getSubtasks,
  addSubtask,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  toggleSubtask,
  // 评论
  getTaskComments,
  createTaskComment,
  updateTaskComment,
  deleteTaskComment,
  // 动态
  getTaskActivities,
  getMyTaskActivities,
  // 分配
  assignTask,
  updateWatchers,
  setTaskWatch,
  // 统计
  getTaskStats,
  getKanbanStats,
  getUserTaskStats,
  // 搜索
  searchTasks,
};
