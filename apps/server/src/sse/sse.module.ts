import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SseController } from "./sse.controller";
import { SseService } from "./sse.service";

@Module({
	controllers: [SseController],
	providers: [SseService],
	exports: [SseService],
	imports: [AuthModule],
})
export class SseModule {}
