import axios from 'axios';
import isString from 'lodash/isString';
import merge from 'lodash/merge';

import ContentTypeEnum from './contentTypeEnum';

// Axios 类封装
export class VAxios {
  constructor(options) {
    this.options = options;
    this.instance = axios.create(options);
    this.setupInterceptors();
  }

  // 创建实例
  createAxios(options) {
    this.instance = axios.create(options);
  }

  // 获取实例
  getAxios() {
    return this.instance;
  }

  // 配置拦截器
  setupInterceptors() {
    const {
      transform,
      requestOptions,
    } = this.options;

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        const { requestInterceptors } = transform || {};
        if (requestInterceptors) {
          config = requestInterceptors(config, this.options);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (res) => {
        const { responseInterceptors } = transform || {};
        if (responseInterceptors) {
          res = responseInterceptors(res);
        }
        return res;
      },
      (error) => {
        const { responseInterceptorsCatch } = transform || {};
        if (responseInterceptorsCatch) {
          return responseInterceptorsCatch(error, this.instance);
        }
        return Promise.reject(error);
      }
    );
  }

  // 通用请求方法
  request(config, options) {
    let conf = merge(config, this.options.requestOptions, options);
    const { transform, requestOptions } = this.options;
    const { beforeRequestHook } = transform || {};
    if (beforeRequestHook) {
      conf = beforeRequestHook(conf, requestOptions);
    }
    return new Promise((resolve, reject) => {
      this.instance
        .request(conf)
        .then((res) => {
          const { transformRequestHook } = transform || {};
          if (transformRequestHook) {
            const ret = transformRequestHook(res, requestOptions);
            resolve(ret);
          } else {
            resolve(res);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // GET请求
  get(config, options) {
    return this.request({ ...config, method: 'GET' }, options);
  }

  // POST请求
  post(config, options) {
    return this.request({ ...config, method: 'POST' }, options);
  }

  // PUT请求
  put(config, options) {
    return this.request({ ...config, method: 'PUT' }, options);
  }

  // DELETE请求
  delete(config, options) {
    return this.request({ ...config, method: 'DELETE' }, options);
  }
}