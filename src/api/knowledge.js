/**
 * 知识库API模块
 * 对应后端接口: /api/v1/knowledge/*
 */

// 获取知识分类列表
export function getKnowledgeCategories() {
  return mockRequest({
    url: '/api/v1/knowledge/categories',
    method: 'get'
  })
}

// 创建知识分类
export function createCategory(data) {
  return mockRequest({
    url: '/api/v1/knowledge/categories',
    method: 'post',
    data
  })
}

// 更新知识分类
export function updateCategory(id, data) {
  return mockRequest({
    url: `/api/v1/knowledge/categories/${id}`,
    method: 'put',
    data
  })
}

// 删除知识分类
export function deleteCategory(id) {
  return mockRequest({
    url: `/api/v1/knowledge/categories/${id}`,
    method: 'delete'
  })
}

// 获取知识文章列表
export function getKnowledgeArticles(params) {
  return mockRequest({
    url: '/api/v1/knowledge/articles',
    method: 'get',
    params
  })
}

// 获取知识文章详情
export function getKnowledgeArticle(id) {
  return mockRequest({
    url: `/api/v1/knowledge/articles/${id}`,
    method: 'get'
  })
}

// 创建知识文章
export function createKnowledgeArticle(data) {
  return mockRequest({
    url: '/api/v1/knowledge/articles',
    method: 'post',
    data
  })
}

// 更新知识文章
export function updateKnowledgeArticle(id, data) {
  return mockRequest({
    url: `/api/v1/knowledge/articles/${id}`,
    method: 'put',
    data
  })
}

// 删除知识文章
export function deleteKnowledgeArticle(id) {
  return mockRequest({
    url: `/api/v1/knowledge/articles/${id}`,
    method: 'delete'
  })
}

// 搜索知识库
export function searchKnowledge(params) {
  return mockRequest({
    url: '/api/v1/knowledge/search',
    method: 'get',
    params
  })
}

// 点赞知识文章
export function likeKnowledgeArticle(id) {
  return mockRequest({
    url: `/api/v1/knowledge/articles/${id}/like`,
    method: 'post'
  })
}

// 阅读知识文章（记录阅读）
export function viewKnowledgeArticle(id) {
  return mockRequest({
    url: `/api/v1/knowledge/articles/${id}/view`,
    method: 'post'
  })
}

// 获取我的知识文章
export function getMyArticles() {
  return mockRequest({
    url: '/api/v1/knowledge/my-articles',
    method: 'get'
  })
}

// 模拟请求函数
function mockRequest(config) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: generateMockData(config) })
    }, 300)
  })
}

function generateMockData(config) {
  const { url, method } = config

  if (url.includes('categories')) {
    return mockCategories()
  }
  if (url.includes('articles')) {
    return mockArticles()
  }
  if (url.includes('search')) {
    return mockSearchResults()
  }

  return {}
}

function mockCategories() {
  return {
    list: [
      { id: 1, name: '公司制度', parentId: null, level: 1, sortOrder: 1, children: [
        { id: 11, name: '员工手册', parentId: 1, level: 2, sortOrder: 1 },
        { id: 12, name: '行政规范', parentId: 1, level: 2, sortOrder: 2 },
        { id: 13, name: '财务制度', parentId: 1, level: 2, sortOrder: 3 }
      ]},
      { id: 2, name: '技术文档', parentId: null, level: 1, sortOrder: 2, children: [
        { id: 21, name: '开发规范', parentId: 2, level: 2, sortOrder: 1 },
        { id: 22, name: 'API文档', parentId: 2, level: 2, sortOrder: 2 },
        { id: 23, name: '产品文档', parentId: 2, level: 2, sortOrder: 3 }
      ]},
      { id: 3, name: '常见问题', parentId: null, level: 1, sortOrder: 3 },
      { id: 4, name: '培训资料', parentId: null, level: 1, sortOrder: 4 }
    ]
  }
}

function mockArticles() {
  return {
    list: [
      {
        id: 1,
        title: '员工考勤管理制度',
        summary: '本文详细说明了公司考勤管理制度，包括上班时间、请假流程、迟到早退处理等...',
        categoryId: 11,
        categoryName: '员工手册',
        authorId: 1,
        authorName: '管理员',
        tags: ['考勤', '制度', '员工'],
        viewCount: 156,
        likeCount: 23,
        commentCount: 5,
        status: 'published',
        publishedAt: '2026-04-15 10:00:00',
        createdAt: '2026-04-10 09:30:00'
      },
      {
        id: 2,
        title: '会议室预订指南',
        summary: '详细介绍如何预订会议室，包括预订规则、使用流程、取消预约等...',
        categoryId: 21,
        categoryName: '开发规范',
        authorId: 2,
        authorName: '张三',
        tags: ['会议室', '预订', '指南'],
        viewCount: 89,
        likeCount: 12,
        commentCount: 3,
        status: 'published',
        publishedAt: '2026-04-18 14:00:00',
        createdAt: '2026-04-16 11:20:00'
      }
    ],
    total: 2,
    page: 1,
    pageSize: 10
  }
}

function mockSearchResults() {
  return {
    list: [
      {
        id: 1,
        title: '员工考勤管理制度',
        summary: '本文详细说明了公司考勤管理制度...',
        categoryName: '员工手册',
        authorName: '管理员',
        viewCount: 156,
        publishedAt: '2026-04-15'
      }
    ],
    total: 1,
    highlight: '员工<em>考勤</em>管理制度'
  }
}
