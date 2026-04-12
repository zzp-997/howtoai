// axios配置
import isString from 'lodash/isString';
import merge from 'lodash/merge';

import ContentTypeEnum from './contentTypeEnum';
import { useUserStore } from '@/store';
import router from '@/router';

import { VAxios } from './Axios';
import { formatRequestDate, joinTimestamp, setObjToUrlParams } from './utils';
import { showToast } from '../common/tools';
import { Dialog } from 'tdesign-mobile-vue';

const host = import.meta.env.VITE_IS_REQUEST_PROXY === 'true'
    ? ''
    : import.meta.env.VITE_API_URL;

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

    throw new ValidationError(data.msg || `请求接口错误, 错误码: ${code}`, data.code || 500);
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

  // 请求拦截器处理
  requestInterceptors: (config, options) => {
    const userStore = useUserStore();
    const { token } = userStore;

    if (token && config?.requestOptions?.withToken !== false) {
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
        message: data.msg,
        config: config,
        response: res
      };
    }
    if (config.requestOptions.autoToast) {
      if (data.code === 200) {
        showToast(config.requestOptions.successToastMsg || (data.msg || '操作成功'));
      } else {
        Dialog.confirm({
          title: '提示',
          content: data.msg || (config.requestOptions.errorToastMsg || '操作失败'),
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
    if (error.code === 401 && config.requestOptions.withToken) {
      Dialog.confirm({
        title: '提示',
        content: '用户信息过期,请重新登录',
        confirmBtn: '确认',
        zIndex: 90000,
        overlayProps: {
          zIndex: 89050,
        },
        onConfirm() {
          router.push('/login');
        },
      });
      return Promise.reject();
    }

    if (!config || !config.requestOptions.retry) return Promise.reject(error);

    config.retryCount = config.retryCount || 0;

    if (config.retryCount >= config.requestOptions.retry.count) {
      if (config.requestOptions.autoToast) {
        showToast('操作失败,请重试');
      }
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
          isJoinPrefix: import.meta.env.VITE_IS_REQUEST_PROXY === 'true',
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