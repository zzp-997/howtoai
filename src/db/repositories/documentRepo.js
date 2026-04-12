/**
 * 文档数据访问层
 */
import { BaseRepository } from './BaseRepository';

class DocumentRepository extends BaseRepository {
  constructor() {
    super('documents');
  }

  /**
   * 根据分类查询
   * @param {number} categoryId
   * @returns {Promise<Array>}
   */
  async findByCategoryId(categoryId) {
    return this.findByIndex('categoryId', categoryId);
  }

  /**
   * 根据上传者查询
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findByUploader(userId) {
    return this.findByIndex('uploadBy', userId);
  }

  /**
   * 搜索文档（按名称）
   * @param {string} keyword
   * @returns {Promise<Array>}
   */
  async searchByName(keyword) {
    const all = await this.findAll();
    if (!keyword) return all;
    const lowerKeyword = keyword.toLowerCase();
    return all.filter(doc =>
      doc.name.toLowerCase().includes(lowerKeyword) ||
      (doc.tags && doc.tags.some(t => t.toLowerCase().includes(lowerKeyword)))
    );
  }

  /**
   * 获取文档详情（包含 Blob）
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async getDocumentWithBlob(id) {
    return this.findById(id);
  }

  /**
   * 获取文档列表（不含 Blob，优化性能）
   * @param {number} categoryId 可选分类筛选
   * @returns {Promise<Array>}
   */
  async getList(categoryId = null) {
    let docs;
    if (categoryId) {
      docs = await this.findByCategoryId(categoryId);
    } else {
      docs = await this.findAll();
    }

    // 移除 Blob 字段，减少数据量
    return docs.map(({ fileBlob, ...rest }) => rest);
  }
}

export const documentRepo = new DocumentRepository();
export default documentRepo;
