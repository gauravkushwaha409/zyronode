import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApiResponse } from '../dto/api-response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((data) => {
        // allow controller to override message via data.message
        const message = data?.message ?? this.resolveMessage(request.method);
        const payload = data?.message ? data.data ?? data : data;

        return ApiResponse.success(payload, message, response.statusCode);
      }),
    );
  }

  private resolveMessage(method: string): string {
    const map: Record<string, string> = {
      GET: 'Data fetched successfully',
      POST: 'Created successfully',
      PUT: 'Updated successfully',
      PATCH: 'Updated successfully',
      DELETE: 'Deleted successfully',
    };
    return map[method] ?? 'Success';
  }
}