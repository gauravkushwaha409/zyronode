import { Global, Module } from "@nestjs/common";
import { EventBridge } from "./services/event-bridge.service";

@Global()
@Module({
  providers: [EventBridge],
  exports: [EventBridge],
})
export class CommonModule {}
