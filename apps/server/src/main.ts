import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule, ObserveInstrument } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptor/response.interceptor";

/** Expand ${VAR} / $VAR placeholders in env values (e.g. VITE_APP_URL=http://localhost:${APP_PORT}) */
function expandEnv(value?: string): string | undefined {
	if (!value) return value;
	return value.replace(/\$\{([^}]+)\}|\$([A-Z0-9_]+)/g, (_, b, c) => process.env[b ?? c] ?? "");
}

function getCorsOrigins(): string[] {
	const appPort = process.env.APP_PORT ?? "3000";
	const chatWidgetPort = process.env.CHAT_WIDGET_PORT ?? "4000";
	const viteAppUrl = expandEnv(process.env.VITE_APP_URL);
	const origins = new Set<string>([
		`http://localhost:${appPort}`,
		`http://localhost:${chatWidgetPort}`,
		"http://localhost:4100",
	]);
	if (viteAppUrl) {
		try {
			const u = new URL(viteAppUrl);
			origins.add(u.origin);
		} catch {
			// ignore invalid URL
		}
	}
	if (process.env.CORS_ORIGINS) {
		for (const o of process.env.CORS_ORIGINS.split(",")) {
			const trimmed = o.trim();
			if (trimmed) origins.add(trimmed);
		}
	}
	return [...origins];
}

function getServerPort(): number {
	const raw = process.env.SERVER_PORT ?? "8000";
	const port = Number.parseInt(raw, 10);
	return Number.isNaN(port) ? 8000 : port;
}

async function bootstrap() {
	const normalize = (v?: string) => v?.replace(/\$\$/g, "$");
	const hasObserveCreds =
		!!normalize(process.env.OBSERVE_APP_KEY) &&
		!!normalize(process.env.OBSERVE_APP_SECRET) 
		
	const app = await NestFactory.create(AppModule, {
		...(hasObserveCreds ? { instrument: ObserveInstrument } : {}),
	});

	app.enableCors({
		origin: getCorsOrigins(),
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

	const port = getServerPort();
	await app.listen(port, "0.0.0.0");
	// eslint-disable-next-line no-console
	console.log(`Server listening on http://localhost:${port} (CORS: ${getCorsOrigins().join(", ")})`);
}
bootstrap();
