import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CallsController } from "./calls.controller";
import { CallsGateway } from "./calls.gateway";
import { TurnService } from "./turn.service";

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET,
		}),
	],
	controllers: [CallsController],
	providers: [CallsGateway, TurnService],
	exports: [TurnService],
})
export class CallsModule {}
