import "dotenv/config";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from "./common/interceptor/response.interceptor";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    "origin": ["http://localhost:3000", "http://192.168.254.12:3000"],
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
  })

  // app.useGlobalInterceptors(new ResponseInterceptor());
  // app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 8000,'0.0.0.0');

}
bootstrap();
