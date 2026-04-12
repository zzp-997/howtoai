/**
 * 文档浏览记录数据访问层
 */
import { BaseRepository } from './BaseRepository';
import dayjs from 'dayjs';

class DocumentViewLogRepository extends BaseRepository {
  constructor() {
    super('document_view_logs');
  }

  /**
   * 记录文档浏览
   * @param {number} userId
   * @param {number} documentId
   */
  async logView(userId, documentId) {
    // 检查今天是否已记录过（避免重复）
    const today = dayjs().format('YYYY-MM-DD');
    const logs = await this.findByIndex('userId', userId);
    const existing = logs.find(l =>
      l.documentId === documentId &&
      dayjs(l.viewedAt).format('YYYY-MM-DD') === today
    );

    if (!existing) {
      await this.create({
        userId,
        documentId,
        viewedAt: new Date()
      });
    }
  }

  /**
   * 获取用户最近浏览的文档
   * @param {number} userId
   * @param {number} limit
   * @returns {Promise<Array>} 返回文档ID列表
   */
  async getRecentViewed(userId, limit = 5) {
    const logs = await this.findByIndex('userId', userId);

    // 按时间倒序，去重
    const seen = new Set();
    const result = [];
    const sorted = logs.sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));

    for (const log of sorted) {
      if (!seen.has(log.documentId)) {
        seen.add(log.documentId);
        result.push({
          documentId: log.documentId,
          viewedAt: log.viewedAt
        });
        if (result.length >= limit) break;
      }
    }

    return result;
  }

  /**
   * 获取用户最常浏览的文档
   * @param {number} userId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getFrequentlyViewed(userId, limit = 5) {
    const logs = await this.findByIndex('userId', userId);

    // 统计浏览次数
    const countMap = {};
    logs.forEach(log => {
      countMap[log.documentId] = (countMap[log.documentId] || 0) + 1;
    });

    // 按次数排序
    return Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([documentId, count]) => ({
        documentId: Number(documentId),
        viewCount: count
      }));
  }

  /**
   * 清理过期记录（保留最近30天）
   */
  async cleanOldRecords() {
    const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();
    const all = await this.findAll();
    const toDelete = all.filter(log => new Date(log.viewedAt) < thirtyDaysAgo);

    for (const log of toDelete) {
      await this.delete(log.id);
    }
  }
}

export const documentViewLogRepo = new DocumentViewLogRepository();
export default documentViewLogRepo;
