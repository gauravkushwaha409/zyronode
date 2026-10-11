import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CallsController } from "./calls.controller";
import { CallsGateway } from "./calls.gateway";
import { CallsService } from "./calls.service";
import { TurnService } from "./turn.service";

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET,
		}),
	],
	controllers: [CallsController],
	providers: [CallsGateway, CallsService, TurnService],
	exports: [CallsService, TurnService],
})
export class CallsModule {}
