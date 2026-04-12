/**
 * 城市配置数据访问层
 * 存储城市的费用预估、天气提示等信息
 */
import { BaseRepository } from './BaseRepository';

class CityConfigRepository extends BaseRepository {
  constructor() {
    super('city_configs');
  }

  /**
   * 根据城市名称查询
   * @param {string} name 城市名称
   * @returns {Promise<Object|null>}
   */
  async findByName(name) {
    const cities = await this.findByIndex('name', name);
    return cities[0] || null;
  }

  /**
   * 根据区域查询城市
   * @param {string} region 区域（华东、华南等）
   * @returns {Promise<Array>}
   */
  async findByRegion(region) {
    return this.findByIndex('region', region);
  }

  /**
   * 获取费用预估
   * @param {string} cityName 城市名称
   * @returns {Promise<Object>}
   */
  async getCostEstimate(cityName) {
    const city = await this.findByName(cityName);
    if (!city) {
      // 返回默认预估
      return {
        transportFee: { min: 500, max: 1500 },
        accommodationFee: { min: 200, max: 500 },
        weatherTips: '请提前查询当地天气'
      };
    }
    return {
      transportFee: {
        min: city.avgTransportPrice * 0.7,
        max: city.avgTransportPrice * 1.3
      },
      accommodationFee: {
        min: city.avgHotelPrice * 0.7,
        max: city.avgHotelPrice * 1.3
      },
      weatherTips: city.weatherTips || ''
    };
  }

  /**
   * 搜索城市（模糊匹配）
   * @param {string} keyword
   * @returns {Promise<Array>}
   */
  async search(keyword) {
    const all = await this.findAll();
    const lowerKeyword = keyword.toLowerCase();
    return all.filter(city =>
      city.name.toLowerCase().includes(lowerKeyword) ||
      city.region?.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * 批量初始化城市数据
   * @param {Array} cities
   */
  async initCities(cities) {
    const existing = await this.count();
    if (existing > 0) return; // 已有数据不重复初始化

    await this.createBatch(cities);
  }
}

// 预置城市数据
export const DEFAULT_CITIES = [
  { name: '北京', region: '华北', avgHotelPrice: 400, avgTransportPrice: 800, weatherTips: '春秋较短，注意保暖' },
  { name: '上海', region: '华东', avgHotelPrice: 450, avgTransportPrice: 1000, weatherTips: '梅雨季节注意带伞' },
  { name: '广州', region: '华南', avgHotelPrice: 350, avgTransportPrice: 1200, weatherTips: '夏季炎热多雨' },
  { name: '深圳', region: '华南', avgHotelPrice: 380, avgTransportPrice: 1200, weatherTips: '夏季炎热多雨' },
  { name: '杭州', region: '华东', avgHotelPrice: 350, avgTransportPrice: 800, weatherTips: '春秋宜人，夏季炎热' },
  { name: '南京', region: '华东', avgHotelPrice: 300, avgTransportPrice: 700, weatherTips: '四季分明' },
  { name: '成都', region: '西南', avgHotelPrice: 280, avgTransportPrice: 1500, weatherTips: '气候湿润，少晒太阳' },
  { name: '武汉', region: '华中', avgHotelPrice: 250, avgTransportPrice: 600, weatherTips: '夏季炎热，火炉城市' },
  { name: '西安', region: '西北', avgHotelPrice: 280, avgTransportPrice: 1000, weatherTips: '气候干燥，注意补水' },
  { name: '重庆', region: '西南', avgHotelPrice: 300, avgTransportPrice: 1400, weatherTips: '多雾潮湿，山路较多' },
  { name: '天津', region: '华北', avgHotelPrice: 320, avgTransportPrice: 400, weatherTips: '冬季干燥寒冷' },
  { name: '苏州', region: '华东', avgHotelPrice: 320, avgTransportPrice: 800, weatherTips: '江南水乡，四季分明' },
  { name: '厦门', region: '华东', avgHotelPrice: 350, avgTransportPrice: 1000, weatherTips: '海滨城市，夏季多台风' },
  { name: '青岛', region: '华东', avgHotelPrice: 300, avgTransportPrice: 800, weatherTips: '海滨城市，夏季凉爽' },
  { name: '大连', region: '东北', avgHotelPrice: 280, avgTransportPrice: 1000, weatherTips: '海滨城市，冬季寒冷' }
];

export const cityConfigRepo = new CityConfigRepository();
export default cityConfigRepo;
