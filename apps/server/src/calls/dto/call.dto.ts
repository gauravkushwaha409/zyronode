import { Type } from "class-transformer";
import {
	ArrayMaxSize,
	IsArray,
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
	ValidateNested,
} from "class-validator";

export const CallTypeValues = ["AUDIO", "VIDEO"] as const;

export class CallInviteDto {
	@IsUUID()
	conversationId!: string;

	@IsEnum(CallTypeValues)
	type!: (typeof CallTypeValues)[number];

	/** Users to ring. Empty/omitted = ring every other member of the conversation. */
	@IsOptional()
	@IsArray()
	@ArrayMaxSize(10)
	@IsString({ each: true })
	inviteeIds?: string[];
}

export class CallIdDto {
	@IsUUID()
	@IsNotEmpty()
	callId!: string;
}

export class SdpDto {
	@IsEnum(["offer", "answer"])
	type!: "offer" | "answer";

	@IsString()
	@IsNotEmpty()
	sdp!: string;
}

export class IceCandidateDto {
	@IsString()
	@IsNotEmpty()
	candidate!: string;

	@IsOptional()
	@IsString()
	sdpMid?: string | null;

	@IsOptional()
	@IsNumber()
	@Min(0)
	sdpMLineIndex?: number | null;
}

export class WebrtcOfferDto extends CallIdDto {
	@IsString()
	@IsNotEmpty()
	to!: string;

	@IsObject()
	@ValidateNested()
	@Type(() => SdpDto)
	sdp!: SdpDto;
}

export class WebrtcAnswerDto extends CallIdDto {
	@IsString()
	@IsNotEmpty()
	to!: string;

	@IsObject()
	@ValidateNested()
	@Type(() => SdpDto)
	sdp!: SdpDto;
}

export class WebrtcIceDto extends CallIdDto {
	@IsString()
	@IsNotEmpty()
	to!: string;

	@IsObject()
	@ValidateNested()
	@Type(() => IceCandidateDto)
	candidate!: IceCandidateDto;
}

export class CallMediaStateDto extends CallIdDto {
	@IsBoolean()
	audio!: boolean;

	@IsBoolean()
	video!: boolean;
}

export class CallHistoryQueryDto {
	@IsUUID()
	conversationId!: string;

	@IsOptional()
	@IsUUID()
	cursor?: string;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	@Max(50)
	limit?: number;
}

export class VisitorCallTokenDto {
	@IsUUID()
	organizationId!: string;

	@IsUUID()
	conversationId!: string;
}
