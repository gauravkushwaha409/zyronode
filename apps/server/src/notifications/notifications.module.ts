import { Module } from "@nestjs/common";
import { firebaseAppProvider } from "./firebase.provider";
import { NotificationsController } from "./notifications.controller";
import { PushService } from "./push.service";
import { PushNotifierService } from "./push-notifier.service";
import { PushTokensService } from "./push-tokens.service";

/**
 * Browser push notifications (FCM Web Push).
 *
 * Leaf module: imports nothing domain-specific so any module (messages,
 * calls, visitor) can depend on PushNotifierService without cycles.
 */
@Module({
	controllers: [NotificationsController],
	providers: [
		firebaseAppProvider,
		PushService,
		PushTokensService,
		PushNotifierService,
	],
	exports: [PushService, PushTokensService, PushNotifierService],
})
export class NotificationsModule {}
