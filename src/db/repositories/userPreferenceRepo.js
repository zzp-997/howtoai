/**
 * 用户偏好设置数据访问层
 * 存储用户的智能推荐偏好
 */
import { BaseRepository } from './BaseRepository';

class UserPreferenceRepository extends BaseRepository {
  constructor() {
    super('user_preferences');
  }

  /**
   * 根据用户ID获取偏好设置
   * @param {number} userId
   * @returns {Promise<Object|null>}
   */
  async findByUserId(userId) {
    return this.findOneByIndex('userId', userId);
  }

  /**
   * 获取或创建用户偏好
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  async getOrCreate(userId) {
    let pref = await this.findByUserId(userId);
    if (!pref) {
      const id = await this.create({
        userId,
        frequentRooms: [],           // 常用会议室ID列表
        frequentTimes: [],            // 常用时段
        lastBookingInfo: null,        // 上次预定信息
        tripTemplates: [],            // 出差模板ID列表（已改为独立表）
        frequentlyVisitedDocs: [],    // 常访问文档ID列表
        searchKeywords: [],           // 搜索关键词
        createdAt: new Date(),
        updatedAt: new Date()
      });
      pref = await this.findById(id);
    }
    return pref;
  }

  /**
   * 更新用户偏好
   * @param {number} userId
   * @param {Object} data
   * @returns {Promise<void>}
   */
  async updateByUserId(userId, data) {
    const pref = await this.findByUserId(userId);
    if (!pref) {
      // 不存在则创建
      await this.create({
        userId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      await this.update(pref.id, {
        ...data,
        updatedAt: new Date()
      });
    }
  }

  /**
   * 记录会议室使用（更新常用会议室）
   * @param {number} userId
   * @param {number} roomId
   */
  async recordRoomUsage(userId, roomId) {
    const pref = await this.getOrCreate(userId);
    let frequentRooms = pref.frequentRooms || [];

    // 统计频率
    const roomCounts = {};
    frequentRooms.forEach(id => {
      roomCounts[id] = (roomCounts[id] || 0) + 1;
    });
    roomCounts[roomId] = (roomCounts[roomId] || 0) + 1;

    // 按频率排序，保留前5个
    const sorted = Object.entries(roomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => Number(id));

    await this.update(pref.id, {
      frequentRooms: sorted,
      updatedAt: new Date()
    });
  }

  /**
   * 记录预定时段（更新常用时段）
   * @param {number} userId
   * @param {number} weekday 星期几 0-6
   * @param {string} time 时间 HH:mm
   */
  async recordTimeUsage(userId, weekday, time) {
    const pref = await this.getOrCreate(userId);
    let frequentTimes = pref.frequentTimes || [];

    // 查找是否已存在相同时段
    const existing = frequentTimes.find(t => t.weekday === weekday && t.time === time);
    if (existing) {
      existing.count = (existing.count || 1) + 1;
    } else {
      frequentTimes.push({ weekday, time, count: 1 });
    }

    // 按频率排序，保留前10个
    frequentTimes.sort((a, b) => (b.count || 1) - (a.count || 1));
    frequentTimes = frequentTimes.slice(0, 10);

    await this.update(pref.id, {
      frequentTimes,
      updatedAt: new Date()
    });
  }

  /**
   * 保存上次预定信息（用于快速复用）
   * @param {number} userId
   * @param {Object} bookingInfo
   */
  async saveLastBookingInfo(userId, bookingInfo) {
    const pref = await this.getOrCreate(userId);
    await this.update(pref.id, {
      lastBookingInfo: {
        ...bookingInfo,
        savedAt: new Date()
      },
      updatedAt: new Date()
    });
  }
}

export const userPreferenceRepo = new UserPreferenceRepository();
export default userPreferenceRepo;
