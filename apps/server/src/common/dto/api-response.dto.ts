export class ApiResponse<T> {
  declare success: boolean;
  declare statusCode: number;
  declare message: string;
  declare data?: T;
  declare error?: string;

  static success<T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
    return { success: true, statusCode, message, data };
  }

  static error(message: string, statusCode: number, error: string): ApiResponse<null> {
    return { success: false, statusCode, message, error };
  }
}