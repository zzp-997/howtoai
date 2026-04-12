/**
 * 公告通知数据访问层
 */
import { BaseRepository } from './BaseRepository';

class AnnouncementRepository extends BaseRepository {
  constructor() {
    super('announcements');
  }

  /**
   * 查询所有公告（按置顶和时间排序）
   * @returns {Promise<Array>}
   */
  async findAllOrdered() {
    const all = await this.findAll();
    return all.sort((a, b) => {
      // 置顶优先
      if (a.isTop !== b.isTop) return b.isTop - a.isTop;
      // 按发布时间倒序
      return new Date(b.publishTime) - new Date(a.publishTime);
    });
  }

  /**
   * 标记公告为已读
   * @param {number} id
   * @param {number} userId
   * @returns {Promise<void>}
   */
  async markAsRead(id, userId) {
    const announcement = await this.findById(id);
    if (!announcement) return;
    const readBy = announcement.readBy || [];
    if (!readBy.includes(userId)) {
      readBy.push(userId);
      await this.update(id, { readBy });
    }
  }

  /**
   * 获取未读公告数量
   * @param {number} userId
   * @returns {Promise<number>}
   */
  async getUnreadCount(userId) {
    const all = await this.findAll();
    return all.filter(a => !(a.readBy || []).includes(userId)).length;
  }

  /**
   * 获取用户未读的公告列表
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findUnread(userId) {
    const all = await this.findAllOrdered();
    return all.filter(a => !(a.readBy || []).includes(userId));
  }

  /**
   * 获取置顶公告
   * @returns {Promise<Array>}
   */
  async findTop() {
    const all = await this.findAll();
    return all.filter(a => a.isTop).sort((a, b) => {
      return new Date(b.publishTime) - new Date(a.publishTime);
    });
  }

  /**
   * 获取公告阅读情况统计
   * @param {number} id
   * @param {Array} allUsers 所有用户列表
   * @returns {Object}
   */
  async getReadStats(id, allUsers) {
    const announcement = await this.findById(id);
    if (!announcement) return { read: [], unread: [] };
    const readBy = announcement.readBy || [];
    const read = allUsers.filter(u => readBy.includes(u.id));
    const unread = allUsers.filter(u => !readBy.includes(u.id));
    return { read, unread, readCount: read.length, unreadCount: unread.length };
  }
}

export const announcementRepo = new AnnouncementRepository();
export default announcementRepo;