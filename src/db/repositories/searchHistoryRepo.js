/**
 * 搜索历史数据访问层
 */
import { BaseRepository } from './BaseRepository';
import dayjs from 'dayjs';

class SearchHistoryRepository extends BaseRepository {
  constructor() {
    super('search_histories');
  }

  /**
   * 记录搜索
   * @param {number} userId
   * @param {string} keyword
   */
  async recordSearch(userId, keyword) {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    await this.create({
      userId,
      keyword: trimmed,
      searchedAt: new Date()
    });
  }

  /**
   * 获取用户搜索历史
   * @param {number} userId
   * @param {number} limit
   * @returns {Promise<Array<string>>}
   */
  async getSearchHistory(userId, limit = 10) {
    const histories = await this.findByIndex('userId', userId);

    // 按时间倒序，去重
    const seen = new Set();
    const result = [];
    const sorted = histories.sort((a, b) => new Date(b.searchedAt) - new Date(a.searchedAt));

    for (const h of sorted) {
      if (!seen.has(h.keyword)) {
        seen.add(h.keyword);
        result.push(h.keyword);
        if (result.length >= limit) break;
      }
    }

    return result;
  }

  /**
   * 获取热门搜索词（全站）
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getHotKeywords(limit = 10) {
    const all = await this.findAll();

    // 只统计最近7天
    const sevenDaysAgo = dayjs().subtract(7, 'day').toDate();
    const recent = all.filter(h => new Date(h.searchedAt) >= sevenDaysAgo);

    // 统计频率
    const countMap = {};
    recent.forEach(h => {
      countMap[h.keyword] = (countMap[h.keyword] || 0) + 1;
    });

    return Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([keyword, count]) => ({ keyword, count }));
  }

  /**
   * 清除用户搜索历史
   * @param {number} userId
   */
  async clearUserHistory(userId) {
    const histories = await this.findByIndex('userId', userId);
    for (const h of histories) {
      await this.delete(h.id);
    }
  }

  /**
   * 清理过期记录（保留最近30天）
   */
  async cleanOldRecords() {
    const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();
    const all = await this.findAll();
    const toDelete = all.filter(h => new Date(h.searchedAt) < thirtyDaysAgo);

    for (const h of toDelete) {
      await this.delete(h.id);
    }
  }
}

export const searchHistoryRepo = new SearchHistoryRepository();
export default searchHistoryRepo;
