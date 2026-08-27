import { Module } from "@nestjs/common";
import { SseModule } from "../sse/sse.module";
import { VisitorController } from "./visitor.controller";
import { VisitorGateway } from "./visitor.gateway";
import { VisitorService } from "./visitor.service";

@Module({
	imports: [SseModule],
	controllers: [VisitorController],
	providers: [VisitorService, VisitorGateway],
	exports: [VisitorService],
})
export class VisitorModule {}
