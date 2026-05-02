/**
 * 知识库API模块
 * 对应后端接口: /api/v1/knowledge/*
 */
import { request } from '@/utils/request';

/**
 * 获取知识分类列表
 * @param {Object} params - 查询参数
 * @param {number} params.parentId - 父分类ID
 * @returns {Promise}
 */
export function getKnowledgeCategories(params = {}) {
  return request.get({
    url: '/v1/knowledge/categories',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建知识分类
 * @param {Object} data - 分类数据
 * @param {string} data.name - 分类名称
 * @param {number} data.parentId - 父分类ID
 * @returns {Promise}
 */
export function createCategory(data) {
  return request.post({
    url: '/v1/knowledge/categories',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新知识分类
 * @param {number} id - 分类ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updateCategory(id, data) {
  return request.put({
    url: `/v1/knowledge/categories/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除知识分类
 * @param {number} id - 分类ID
 * @returns {Promise}
 */
export function deleteCategory(id) {
  return request.delete({
    url: `/v1/knowledge/categories/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取知识文章列表
 * @param {Object} params - 查询参数
 * @param {number} params.categoryId - 分类ID
 * @param {string} params.status - 状态
 * @param {number} params.authorId - 作者ID
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export function getKnowledgeArticles(params = {}) {
  return request.get({
    url: '/v1/knowledge/articles',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取知识文章详情
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export function getKnowledgeArticle(id) {
  return request.get({
    url: `/v1/knowledge/articles/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建知识文章
 * @param {Object} data - 文章数据
 * @param {string} data.title - 文章标题
 * @param {string} data.content - 文章内容
 * @param {string} data.summary - 文章摘要
 * @param {number} data.categoryId - 分类ID
 * @param {Array} data.tags - 标签
 * @returns {Promise}
 */
export function createKnowledgeArticle(data) {
  return request.post({
    url: '/v1/knowledge/articles',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新知识文章
 * @param {number} id - 文章ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updateKnowledgeArticle(id, data) {
  return request.put({
    url: `/v1/knowledge/articles/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除知识文章
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export function deleteKnowledgeArticle(id) {
  return request.delete({
    url: `/v1/knowledge/articles/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 搜索知识库
 * @param {Object} params - 搜索参数
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.categoryId - 分类ID
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export function searchKnowledge(params = {}) {
  return request.get({
    url: '/v1/knowledge/search',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 点赞知识文章
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export function likeKnowledgeArticle(id) {
  return request.post({
    url: `/v1/knowledge/articles/${id}/like`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 阅读知识文章（记录阅读）
 * @param {number} id - 文章ID
 * @param {number} readDuration - 阅读时长(秒)
 * @returns {Promise}
 */
export function viewKnowledgeArticle(id, readDuration = 0) {
  return request.post({
    url: `/v1/knowledge/articles/${id}/view`,
    params: { readDuration },
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取我的知识文章
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export function getMyArticles(params = {}) {
  return request.get({
    url: '/v1/knowledge/my-articles',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

export default {
  getKnowledgeCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getKnowledgeArticles,
  getKnowledgeArticle,
  createKnowledgeArticle,
  updateKnowledgeArticle,
  deleteKnowledgeArticle,
  searchKnowledge,
  likeKnowledgeArticle,
  viewKnowledgeArticle,
  getMyArticles,
};
