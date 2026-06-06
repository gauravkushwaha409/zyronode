import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class BaseAPIService {
  private api: AxiosInstance;

  constructor(apiInstance: AxiosInstance) {
    this.api = apiInstance;
  }

  /**
   * TResponse: The expected data shape inside 'data'
   * TBody: The request payload shape
   */
  async post<TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    const response = await this.api.post<AxiosResponse>(
      url,
      data,
      config,
    );
    return response;
  }

  async get<TResponse = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ){
    return this.api.get<TResponse>(url, config);
    
  }

  async put<TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    const response = await this.api.put<AxiosResponse>(
      url,
      data,
      config,
    );
    return response;
  }

  async patch<TBody = unknown>(
    url: string,
    data?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    const response = await this.api.patch<AxiosResponse>(
      url,
      data,
      config,
    );
    return response;
  }

  async delete<TResponse = void>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    const response = await this.api.delete<AxiosResponse<TResponse>>(url, config);
    return response;
  }
}
