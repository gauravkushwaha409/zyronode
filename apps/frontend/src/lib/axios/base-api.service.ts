import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../../types';

export class BaseAPIService {
  private api: AxiosInstance;

  constructor(apiInstance: AxiosInstance) {
    this.api = apiInstance;
  }

  /**
   * TResponse: The expected data shape inside 'data'
   * TBody: The request payload shape
   */
  async post<TResponse = Record<string, unknown>, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<TResponse>> {
    const response = await this.api.post<ApiResponse<TResponse>>(
      url,
      data,
      config,
    );
    return response.data;
  }

  async get<TResponse = Record<string, unknown>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<TResponse>> {
    const response = await this.api.get<ApiResponse<TResponse>>(url, config);
    return response.data;
  }

  async put<TResponse = Record<string, unknown>, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<TResponse>> {
    const response = await this.api.put<ApiResponse<TResponse>>(
      url,
      data,
      config,
    );
    return response.data;
  }

  async patch<TResponse = Record<string, unknown>, TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<TResponse>> {
    const response = await this.api.patch<ApiResponse<TResponse>>(
      url,
      data,
      config,
    );
    return response.data;
  }

  async delete<TResponse = void>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<TResponse>> {
    const response = await this.api.delete<ApiResponse<TResponse>>(url, config);
    return response.data;
  }
}
