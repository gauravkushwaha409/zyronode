import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

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

		let message = "Internal server error";
		let errorCode: string | null = null;

		if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
			const resp = exceptionResponse as Record<string, unknown>;

			if (Array.isArray(resp.message)) {
				message = resp.message.join(", ");
			} else if (typeof resp.message === "string") {
				message = resp.message;
			} else if (typeof resp.error === "string") {
				message = resp.error;
			}

			if (typeof resp.error_code === "string") {
				errorCode = resp.error_code;
			}
		} else if (typeof exceptionResponse === "string") {
			message = exceptionResponse;
		}

		response.status(statusCode).json({
			success: false,
			status_code: statusCode,
			error: message,
			error_code: errorCode,
		});
	}
}
