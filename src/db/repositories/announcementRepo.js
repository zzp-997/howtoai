/**
 * 公告通知数据访问层
 */
import { BaseRepository } from './BaseRepository';

// 分类配置
export const ANNOUNCEMENT_CATEGORIES = {
  policy: { label: '制度', color: '#0052D9', icon: 'FileIcon' },
  activity: { label: '活动', color: '#ED7B2F', icon: 'CalendarIcon' },
  notice: { label: '通知', color: '#00A870', icon: 'NotificationIcon' }
};

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
   * 按分类查询公告
   * @param {string} category 分类标识
   * @returns {Promise<Array>}
   */
  async findByCategory(category) {
    const all = await this.findAllOrdered();
    if (!category) return all;
    return all.filter(a => a.category === category);
  }

  /**
   * 获取重要公告（需要弹窗提醒的）
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findImportantUnread(userId) {
    const all = await this.findAllOrdered();
    return all.filter(a => {
      const isUnread = !(a.readBy || []).includes(userId);
      const notPopupShown = !(a.popupShown || []).includes(userId);
      const isImportant = a.isRemind || a.isTop;
      return isUnread && notPopupShown && isImportant;
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
   * 标记公告已弹窗展示
   * @param {number} id
   * @param {number} userId
   * @returns {Promise<void>}
   */
  async markPopupShown(id, userId) {
    const announcement = await this.findById(id);
    if (!announcement) return;
    const popupShown = announcement.popupShown || [];
    if (!popupShown.includes(userId)) {
      popupShown.push(userId);
      await this.update(id, { popupShown });
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

  /**
   * 创建公告（支持分类）
   * @param {Object} data
   * @returns {Promise<number>}
   */
  async createAnnouncement(data) {
    // 生成摘要
    let summary = data.summary;
    if (!summary && data.content) {
      summary = data.content.substring(0, 50) + (data.content.length > 50 ? '...' : '');
    }

    // 根据标题自动分类
    let category = data.category;
    if (!category) {
      const title = data.title.toLowerCase();
      if (title.includes('制度') || title.includes('规定') || title.includes('政策')) {
        category = 'policy';
      } else if (title.includes('活动') || title.includes('团建') || title.includes('报名')) {
        category = 'activity';
      } else {
        category = 'notice';
      }
    }

    return this.create({
      ...data,
      category,
      categoryLabel: ANNOUNCEMENT_CATEGORIES[category]?.label || '通知',
      summary,
      popupShown: [],
      createdAt: new Date()
    });
  }
}

export const announcementRepo = new AnnouncementRepository();
export default announcementRepo;