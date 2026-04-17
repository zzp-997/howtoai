import { request } from '@/utils/request';

/**
 * 获取文档分类列表
 * @returns {Promise}
 */
export function getDocumentCategories() {
  return request.get({
    url: '/v1/documents/categories',
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建文档分类
 * @param {Object} data
 * @returns {Promise}
 */
export function createDocumentCategory(data) {
  return request.post({
    url: '/v1/documents/categories',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 更新文档分类
 * @param {number} id
 * @param {Object} data
 * @returns {Promise}
 */
export function updateDocumentCategory(id, data) {
  return request.put({
    url: `/v1/documents/categories/${id}`,
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除文档分类
 * @param {number} id
 * @returns {Promise}
 */
export function deleteDocumentCategory(id) {
  return request.delete({
    url: `/v1/documents/categories/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取文档列表
 * @param {Object} params
 * @returns {Promise}
 */
export function getDocuments(params = {}) {
  return request.get({
    url: '/v1/documents',
    params,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 获取文档详情
 * @param {number} id
 * @returns {Promise}
 */
export function getDocument(id) {
  return request.get({
    url: `/v1/documents/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 创建文档
 * @param {Object} data
 * @returns {Promise}
 */
export function createDocument(data) {
  return request.post({
    url: '/v1/documents',
    data,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}

/**
 * 删除文档
 * @param {number} id
 * @returns {Promise}
 */
export function deleteDocument(id) {
  return request.delete({
    url: `/v1/documents/${id}`,
  }, {
    isJoinPrefix: true,
    isTransformResponse: false
  });
}
