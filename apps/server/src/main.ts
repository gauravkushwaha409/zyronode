import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptor/response.interceptor";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: ["http://localhost:3000", "http://localhost:4000","http://localhost:4001"],
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		credentials: true,
	});

	app.use(cookieParser());

	app.useGlobalInterceptors(new ResponseInterceptor());
	app.useGlobalFilters(new HttpExceptionFilter());
	app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

	app.setGlobalPrefix("/api/v1",{
		exclude: []
	});

	/**
	 * Swagger API Documentation
	 */
	const config = new DocumentBuilder()
		.setTitle("Chat App API")
		.setDescription("API documentation for the Chat App backend")
		.setVersion("1.0")
		.addTag("Auth", "Authentication and authorization endpoints")
		.addTag("Organization", "Organization management endpoints")
		.addTag("Conversation", "Conversation management endpoints")
		.addTag("Message", "Message management endpoints")
		.addTag("Inbox", "Inbox management endpoints")
		.addTag("Visitor", "Visitor management endpoints")
		.addTag("OTP", "OTP verification endpoints")
		.addTag("SSE", "Server-Sent Events endpoints")
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api/v1/docs", app, document);

	await app.listen(8000, "0.0.0.0");
}
bootstrap();
