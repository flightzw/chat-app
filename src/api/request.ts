import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { clearTokenInfo, getRefreshToken, getToken, saveTokenInfo } from '@/store/auth';
import { refreshToken } from './user';

export type RespResult<T> = {
  data: T;
  total?: number;
  code: number;
  message: string;
  matedata?: Record<string, unknown>;
};

interface RetryAxiosRequestConfig<D = unknown> extends AxiosRequestConfig<D> {
  _retry?: boolean;
}

type retryRequest = () => void;

const retryQueue: retryRequest[] = []; // 重试请求队列
let isRefreshing = false; // token 续期标记

const request = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_BASE_URL,
  timeout: 3000,
});

request.interceptors.request.use((config) => {
  const token = getToken();
  if (config.url !== '/v1/refresh-token' && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (resp) => resp.data,
  async (err: AxiosError) => {
    const requestConfig = err.config as RetryAxiosRequestConfig;
    if (!requestConfig._retry) {
      requestConfig._retry = false;
    }
    if (err.response?.status === 401 && getRefreshToken() !== '' && !requestConfig._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          retryQueue.push(() => resolve(request(requestConfig)));
        });
      }
      requestConfig._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshToken();
        saveTokenInfo(data.token, data.refresh_token);
        while (retryQueue.length > 0) {
          const callback = retryQueue.shift() as retryRequest;
          callback();
        }
        return request(requestConfig);
      } catch (err) {
        clearTokenInfo();
        window.location.replace('/login');
        window.location.reload();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    if (typeof err.response?.data === 'object' && err.response.data !== null) {
      return Promise.reject(err.response.data);
    }
    return Promise.reject(err);
  }
);

export default request;
