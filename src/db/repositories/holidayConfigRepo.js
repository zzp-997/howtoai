/**
 * 节假日配置数据访问层
 */
import { BaseRepository } from './BaseRepository';
import dayjs from 'dayjs';

class HolidayConfigRepository extends BaseRepository {
  constructor() {
    super('holiday_configs');
  }

  /**
   * 根据日期查询
   * @param {string} date YYYY-MM-DD
   * @returns {Promise<Object|null>}
   */
  async findByDate(date) {
    return this.findOneByIndex('date', date);
  }

  /**
   * 查询日期范围内的节假日
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Promise<Array>}
   */
  async findByDateRange(startDate, endDate) {
    const all = await this.findAll();
    return all.filter(h => h.date >= startDate && h.date <= endDate);
  }

  /**
   * 判断是否为工作日
   * @param {string} date YYYY-MM-DD
   * @returns {Promise<boolean>}
   */
  async isWorkday(date) {
    const holiday = await this.findByDate(date);
    if (holiday) {
      return holiday.isWorkday; // 调休可能为工作日
    }

    // 未配置的日期，按周末判断
    const d = dayjs(date);
    const day = d.day();
    return day !== 0 && day !== 6;
  }

  /**
   * 获取下一个工作日
   * @param {string} fromDate 起始日期
   * @returns {Promise<string>}
   */
  async getNextWorkday(fromDate) {
    let date = dayjs(fromDate);
    let maxDays = 30; // 最多查找30天

    while (maxDays > 0) {
      date = date.add(1, 'day');
      const dateStr = date.format('YYYY-MM-DD');
      if (await this.isWorkday(dateStr)) {
        return dateStr;
      }
      maxDays--;
    }

    return date.format('YYYY-MM-DD');
  }

  /**
   * 计算连休推荐
   * @param {number} leaveBalance 剩余假期余额
   * @returns {Promise<Array>}
   */
  async getContinuousLeaveRecommendations(leaveBalance) {
    const today = dayjs();
    const recommendations = [];

    // 查找未来3个月的节假日
    const endDate = today.add(90, 'day').format('YYYY-MM-DD');
    const holidays = await this.findByDateRange(today.format('YYYY-MM-DD'), endDate);

    // 遍历节假日，计算连休机会
    for (const holiday of holidays) {
      if (holiday.isWorkday) continue; // 跳过调休的工作日

      const holidayDate = dayjs(holiday.date);
      const dayOfWeek = holidayDate.day();

      // 周末的情况
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // 周五请假可以连休3天
        if (dayOfWeek === 6) {
          const friday = holidayDate.subtract(1, 'day');
          if (await this.isWorkday(friday.format('YYYY-MM-DD'))) {
            recommendations.push({
              type: 'weekend',
              suggestDate: friday.format('YYYY-MM-DD'),
              leaveDays: 1,
              totalDays: 3,
              reason: '请假1天，连休3天'
            });
          }
        }
        // 周日请假可以连休3天
        if (dayOfWeek === 0) {
          const monday = holidayDate.add(1, 'day');
          if (await this.isWorkday(monday.format('YYYY-MM-DD'))) {
            recommendations.push({
              type: 'weekend',
              suggestDate: monday.format('YYYY-MM-DD'),
              leaveDays: 1,
              totalDays: 3,
              reason: '请假1天，连休3天'
            });
          }
        }
      }

      // 法定节假日连休
      if (holiday.name && !holiday.isWorkday) {
        // 查找相邻的节假日
        const prevDay = holidayDate.subtract(1, 'day');
        const prevHoliday = await this.findByDate(prevDay.format('YYYY-MM-DD'));

        if (prevHoliday && !prevHoliday.isWorkday) {
          // 连续的假日，检查是否可以请假连接
          const beforePrev = prevDay.subtract(1, 'day');
          const afterHoliday = holidayDate.add(1, 'day');

          // 在假日前后请假
          if (await this.isWorkday(beforePrev.format('YYYY-MM-DD'))) {
            recommendations.push({
              type: 'holiday',
              suggestDate: beforePrev.format('YYYY-MM-DD'),
              leaveDays: 1,
              totalDays: 4,
              reason: `请假1天，连接${holiday.name}连休`
            });
          }
        }
      }
    }

    // 过滤掉超过余额的建议，并按性价比排序
    return recommendations
      .filter(r => r.leaveDays <= leaveBalance)
      .sort((a, b) => (b.totalDays / b.leaveDays) - (a.totalDays / a.leaveDays))
      .slice(0, 3);
  }

  /**
   * 初始化节假日数据
   * @param {number} year 年份
   */
  async initHolidays(year) {
    const existing = await this.count();
    if (existing > 0) return;

    // 2026年节假日数据（示例）
    const holidays = [
      // 元旦
      { date: `${year}-01-01`, name: '元旦', isWorkday: false },
      { date: `${year}-01-02`, name: '元旦', isWorkday: false },
      { date: `${year}-01-03`, name: '元旦', isWorkday: false },
      // 春节（示例）
      { date: `${year}-02-07`, name: '春节', isWorkday: false },
      { date: `${year}-02-08`, name: '春节', isWorkday: false },
      { date: `${year}-02-09`, name: '春节', isWorkday: false },
      { date: `${year}-02-10`, name: '春节', isWorkday: false },
      { date: `${year}-02-11`, name: '春节', isWorkday: false },
      { date: `${year}-02-12`, name: '春节', isWorkday: false },
      { date: `${year}-02-13`, name: '春节', isWorkday: false },
      // 清明
      { date: `${year}-04-04`, name: '清明节', isWorkday: false },
      { date: `${year}-04-05`, name: '清明节', isWorkday: false },
      { date: `${year}-04-06`, name: '清明节', isWorkday: false },
      // 五一
      { date: `${year}-05-01`, name: '劳动节', isWorkday: false },
      { date: `${year}-05-02`, name: '劳动节', isWorkday: false },
      { date: `${year}-05-03`, name: '劳动节', isWorkday: false },
      { date: `${year}-05-04`, name: '劳动节', isWorkday: false },
      { date: `${year}-05-05`, name: '劳动节', isWorkday: false },
      // 端午
      { date: `${year}-05-31`, name: '端午节', isWorkday: false },
      { date: `${year}-06-01`, name: '端午节', isWorkday: false },
      { date: `${year}-06-02`, name: '端午节', isWorkday: false },
      // 中秋+国庆
      { date: `${year}-10-01`, name: '国庆节', isWorkday: false },
      { date: `${year}-10-02`, name: '国庆节', isWorkday: false },
      { date: `${year}-10-03`, name: '国庆节', isWorkday: false },
      { date: `${year}-10-04`, name: '国庆节', isWorkday: false },
      { date: `${year}-10-05`, name: '国庆节', isWorkday: false },
      { date: `${year}-10-06`, name: '国庆节', isWorkday: false },
      { date: `${year}-10-07`, name: '国庆节', isWorkday: false },
      { date: `${year}-10-08`, name: '国庆节', isWorkday: false }
    ];

    await this.createBatch(holidays);
  }
}

export const holidayConfigRepo = new HolidayConfigRepository();
export default holidayConfigRepo;
