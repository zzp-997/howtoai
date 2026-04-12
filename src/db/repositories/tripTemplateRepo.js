/**
 * 出差模板数据访问层
 */
import { BaseRepository } from './BaseRepository';

class TripTemplateRepository extends BaseRepository {
  constructor() {
    super('trip_templates');
  }

  /**
   * 根据用户ID查询模板
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findByUserId(userId) {
    return this.findByIndex('userId', userId);
  }

  /**
   * 创建出差模板
   * @param {Object} data
   * @returns {Promise<number>}
   */
  async createTemplate(data) {
    return this.create({
      ...data,
      createdAt: new Date()
    });
  }

  /**
   * 更新模板
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<void>}
   */
  async updateTemplate(id, data) {
    return this.update(id, {
      ...data,
      updatedAt: new Date()
    });
  }

  /**
   * 应用模板（生成差旅申请数据）
   * @param {number} templateId
   * @returns {Promise<Object>}
   */
  async applyTemplate(templateId) {
    const template = await this.findById(templateId);
    if (!template) throw new Error('模板不存在');

    return {
      destination: template.destination,
      reason: template.reason,
      estTransportFee: template.estTransportFee || 0,
      estAccomFee: template.estAccomFee || 0
    };
  }

  /**
   * 获取用户常用模板（按使用次数排序）
   * @param {number} userId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getFrequentTemplates(userId, limit = 5) {
    const templates = await this.findByUserId(userId);
    return templates
      .sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
      .slice(0, limit);
  }

  /**
   * 增加模板使用次数
   * @param {number} id
   */
  async incrementUseCount(id) {
    const template = await this.findById(id);
    if (template) {
      await this.update(id, {
        useCount: (template.useCount || 0) + 1,
        lastUsedAt: new Date()
      });
    }
  }
}

export const tripTemplateRepo = new TripTemplateRepository();
export default tripTemplateRepo;
