// axios配置
import isString from 'lodash/isString';
import merge from 'lodash/merge';

import ContentTypeEnum from './contentTypeEnum';
import { useUserStore } from '@/store';
import router from '@/router';

import { VAxios } from './Axios';
import { formatRequestDate, joinTimestamp, setObjToUrlParams } from './utils';
import { showToast } from '../common/tools';
import { getErrorMsg, isAuthError } from '../common/errors';
import { Dialog } from 'tdesign-mobile-vue';

/**
 * 解析JWT Token获取payload
 * @param {string} token - JWT token
 * @returns {Object|null} payload对象或null
 */
function parseJwt(token) {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn('解析JWT Token失败:', e);
    return null;
  }
}

/**
 * 检查Token是否即将过期（5分钟内）
 * @param {string} token - JWT token
 * @returns {boolean} 是否即将过期
 */
function isTokenExpiringSoon(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false;

  const expiresAt = payload.exp * 1000; // 转换为毫秒
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  return (expiresAt - now) < fiveMinutes;
}

const host = import.meta.env.VITE_IS_REQUEST_PROXY === 'true'
    ? ''
    : import.meta.env.VITE_API_URL;

// Token刷新相关状态
let isRefreshingToken = false;
let pendingRequests = [];

/**
 * 将等待中的请求加入队列
 * 刷新成功后统一用新Token重新发起
 * @param {Function} resolver - Promise resolve函数，用于传递新token
 */
function subscribeTokenRefresh(resolver) {
  pendingRequests.push(resolver);
}

/**
 * Token刷新完成后，重发所有等待中的请求
 * @param {string} newToken - 新的access token
 */
function onTokenRefreshed(newToken) {
  pendingRequests.forEach(resolver => resolver(newToken));
  pendingRequests = [];
}

/**
 * Token刷新失败，拒绝所有等待中的请求
 */
function rejectPendingRequests() {
  pendingRequests.forEach(resolver => resolver(null));
  pendingRequests = [];
}

// 数据处理，方便区分多种处理方式
const transform = {
  // 处理请求数据。如果数据不是预期格式，可直接抛出错误
  transformRequestHook: (res, options) => {
    const { isTransformResponse, isReturnNativeResponse } = options;

    // 如果204无内容直接返回
    const method = res.config.method?.toLowerCase();
    if (res.status === 204 && ['put', 'patch', 'delete'].includes(method)) {
      return res;
    }

    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      return res;
    }
    // 不进行任何处理，直接返回
    if (!isTransformResponse) {
      return res.data;
    }

    // 错误的时候返回
    const { data } = res;
    if (!data) {
      throw new Error('请求接口错误');
    }

    //  这里 code为 后台统一的字段
    const { code } = data;

    // 这里逻辑可以根据项目进行修改
    const hasSuccess = data && code === 200;
    if (hasSuccess) {
      return data;
    }
    class ValidationError extends Error {
      constructor(message, code) {
        super(message);
        this.code = code;
      }
    }

    // 认证类错误（20001/20002）→ 自动登出 + 跳转登录页
    if (isAuthError(data.code)) {
      const msg = getErrorMsg(data.code, data.message)
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
      showToast(msg)
      return null
    }

    const msg = getErrorMsg(data.code, data.message)
    throw new ValidationError(msg, data.code)
  },

  // 请求前处理配置
  beforeRequestHook: (config, options) => {
    const {
      apiUrl,
      isJoinPrefix,
      urlPrefix,
      joinParamsToUrl,
      formatDate,
      joinTime = true,
    } = options;
    // 添加接口前缀
    if (isJoinPrefix && urlPrefix && isString(urlPrefix)) {
      config.url = `${urlPrefix}${config.url}`;
    }

    // 将baseUrl拼接
    if (apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`;
    }
    const params = config.params || {};
    const data = config.data || false;

    if (formatDate && data && !isString(data)) {
      formatRequestDate(data);
    }
    if (config.method?.toUpperCase() === 'GET') {
      if (!isString(params)) {
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false));
      } else {
        config.url = `${config.url + params}${joinTimestamp(joinTime, true)}`;
        config.params = undefined;
      }
    } else if (!isString(params)) {
      if (formatDate) {
        formatRequestDate(params);
      }
      if (
        Reflect.has(config, 'data') &&
        config.data &&
        (Object.keys(config.data).length > 0 || data instanceof FormData)
      ) {
        config.data = data;
        config.params = params;
      } else {
        config.data = params;
        config.params = undefined;
      }
      if (joinParamsToUrl) {
        config.url = setObjToUrlParams(config.url, { ...config.params, ...config.data });
      }
    } else {
      config.url += params;
      config.params = undefined;
    }
    return config;
  },

  // 请求拦截器处理 - 自动检测并刷新Token
  requestInterceptors: async (config, options) => {
    const userStore = useUserStore();
    const token = userStore.token;

    // 如果不需要携带Token，直接返回
    if (config?.requestOptions?.withToken === false) {
      return config;
    }

    // 如果没有Token，直接返回
    if (!token) {
      return config;
    }

    // 检查是否是刷新Token请求
    const isRefreshRequest = config.url?.includes('/auth/refresh');

    // 如果正在刷新Token，将请求加入等待队列
    if (isRefreshingToken) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (newToken) {
            // 刷新成功，使用新Token
            config.headers.Authorization = options.authenticationScheme
              ? `${options.authenticationScheme}${newToken}`
              : newToken;
            resolve(config);
          } else {
            // 刷新失败，拒绝了请求
            reject(new Error('Token刷新失败，请重新登录'));
          }
        });
      });
    }

    // 检查Token是否即将过期（排除refresh接口本身）
    if (!isRefreshRequest && isTokenExpiringSoon(token)) {
      console.log('Token即将过期，发起刷新请求...');

      // 标记正在刷新
      isRefreshingToken = true;

      try {
        // 调用刷新Token方法
        const success = await userStore.refreshAccessToken();

        if (success && userStore.token) {
          // 刷新成功，更新当前请求头
          config.headers.Authorization = options.authenticationScheme
            ? `${options.authenticationScheme}${userStore.token}`
            : userStore.token;

          // 通知所有等待的请求
          onTokenRefreshed(userStore.token);
        } else {
          // 刷新失败，拒绝所有等待的请求
          console.error('Token刷新返回失败');
          rejectPendingRequests();
          // 跳转到登录页
          await userStore.logout();
          router.push('/login');
        }
      } catch (error) {
        console.error('Token刷新失败:', error);
        // 刷新失败，拒绝所有等待的请求
        rejectPendingRequests();
        // 清除状态并跳转登录页
        await userStore.logout();
        router.push('/login');
        // 抛出错误，中止当前请求
        return Promise.reject(error);
      } finally {
        isRefreshingToken = false;
      }
    } else {
      // Token未过期，直接使用
      config.headers.Authorization = options.authenticationScheme
        ? `${options.authenticationScheme}${token}`
        : token;
    }

    return config;
  },

  // 响应拦截器处理
  responseInterceptors: (res) => {
    const { config, data } = res;
    if (data.code === 401 && config.requestOptions?.withToken) {
      throw {
        code: 401,
        message: data.message,
        config: config,
        response: res
      };
    }
    if (config.requestOptions.autoToast) {
      if (data.code === 200) {
        showToast(config.requestOptions.successToastMsg || (data.message || '操作成功'));
      } else {
        Dialog.confirm({
          title: '提示',
          content: data.message || (config.requestOptions.errorToastMsg || '操作失败'),
          confirmBtn: '确认',
          zIndex: 90000,
          overlayProps: {
            zIndex: 89050,
          }
        });
      }
    }
    return res;
  },

  // 响应错误处理
  responseInterceptorsCatch: (error, instance) => {
    const { config, response } = error;

    // 处理 429 限流状态码
    if (response?.status === 429) {
      const retryAfter = response?.headers?.['retry-after'] || response?.data?.retryAfter || 60;
      const retryMsg = `请求过于频繁，请等待 ${retryAfter} 秒后再试`;

      Dialog.confirm({
        title: '操作过于频繁',
        content: retryMsg,
        confirmBtn: '我知道了',
        zIndex: 90000,
        overlayProps: {
          zIndex: 89050,
        },
      });
      return Promise.reject(error);
    }

    // 处理 401 未授权
    if (response?.status === 401 || error.code === 401) {
      Dialog.confirm({
        title: '提示',
        content: response?.data?.message || '用户信息过期,请重新登录',
        confirmBtn: '确认',
        zIndex: 90000,
        overlayProps: {
          zIndex: 89050,
        },
        onConfirm() {
          const userStore = useUserStore();
          userStore.logout();
          router.push('/login');
        },
      });
      return Promise.reject(error);
    }

    // 处理其他错误，提取后端返回的 message
    if (response?.data?.message) {
      error.message = response.data.message;
    }

    // 如果开启了自动提示，显示错误信息
    if (config?.requestOptions?.autoToast) {
      showToast(response?.data?.message || '操作失败,请重试');
    }

    if (!config || !config.requestOptions.retry) return Promise.reject(error);

    config.retryCount = config.retryCount || 0;

    if (config.retryCount >= config.requestOptions.retry.count) {
      return Promise.reject(error);
    }

    config.retryCount += 1;

    const backoff = new Promise((resolve) => {
      setTimeout(() => {
        resolve(config);
      }, config.requestOptions.retry.delay || 1);
    });
    config.headers = { ...config.headers, 'Content-Type': ContentTypeEnum.Json };
    return backoff.then((config) => instance.request(config));
  },
};

function createAxios(opt) {
  return new VAxios(
    merge({
        authenticationScheme: 'Bearer ',
        timeout: 10 * 1000,
        withCredentials: false,
        headers: { 'Content-Type': ContentTypeEnum.Json },
        transform,
        requestOptions: {
          apiUrl: host,
          isJoinPrefix: true,
          urlPrefix: import.meta.env.VITE_API_URL_PREFIX,
          isReturnNativeResponse: false,
          isTransformResponse: true,
          joinParamsToUrl: false,
          formatDate: true,
          joinTime: true,
          ignoreCancelToken: true,
          withToken: true,
          autoToast: false,
          successToastMsg: '',
          errorToastMsg: '',
          retry: {
            count: 3,
            delay: 1000,
          },
        },
      },
      opt || {},
    ),
  );
}
export const request = createAxios();