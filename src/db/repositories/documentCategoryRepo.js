/**
 * 文档分类数据访问层
 */
import { BaseRepository } from './BaseRepository';

class DocumentCategoryRepository extends BaseRepository {
  constructor() {
    super('document_categories');
  }

  /**
   * 根据名称查询
   * @param {string} name
   * @returns {Promise<Object|null>}
   */
  async findByName(name) {
    const all = await this.findAll();
    return all.find(c => c.name === name) || null;
  }

  /**
   * 获取所有分类（按名称排序）
   * @returns {Promise<Array>}
   */
  async findAllOrdered() {
    const categories = await this.findAll();
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export const documentCategoryRepo = new DocumentCategoryRepository();
export default documentCategoryRepo;
