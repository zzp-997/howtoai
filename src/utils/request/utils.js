import { isObject } from 'lodash';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * 格式化请求日期参数
 * @param {Object} data - 请求数据
 */
export function formatRequestDate(data) {
  if (isObject(data)) {
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value instanceof Date) {
        data[key] = dayjs(value).format(DATE_TIME_FORMAT);
      } else if (isObject(value)) {
        formatRequestDate(value);
      }
    });
  }
}

/**
 * 添加时间戳参数
 * @param {boolean} join - 是否添加时间戳
 * @param {boolean} restful - 是否为restful风格
 * @returns {Object|string} 时间戳参数
 */
export function joinTimestamp(join, restful) {
  if (!join) {
    return restful ? '' : {};
  }
  const now = new Date().getTime();
  if (restful) {
    return `?t=${now}`;
  }
  return { t: now };
}

/**
 * 将对象参数添加到URL
 * @param {string} url - 原始URL
 * @param {Object} params - 参数对象
 * @returns {string} 新URL
 */
export function setObjToUrlParams(url, params) {
  const keys = Object.keys(params);
  if (keys.length === 0) {
    return url;
  }
  const search = keys
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  return `${url}?${search}`;
}