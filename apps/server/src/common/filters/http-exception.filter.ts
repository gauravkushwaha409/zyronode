import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { ApiResponse } from "../dto/api-response.dto";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();


		console.error("Exception caught by HttpExceptionFilter: ", exception);

		const statusCode =
			exception instanceof HttpException ? exception.getStatus() : 500;

		const exceptionResponse =
			exception instanceof HttpException ? exception.getResponse() : null;

      const message = exceptionResponse && typeof exceptionResponse === "object" && "error" in exceptionResponse ? exceptionResponse.error : null;

      const errorCode = exceptionResponse && typeof exceptionResponse === "object" && "error_code" in exceptionResponse ? exceptionResponse.error_code : null;

		response.status(statusCode).json({
			success: false,
			statusCode: statusCode,
			error: message,
			errorCode: errorCode,
		});
	}
}
