import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEnum(["TEXT", "FILE", "INTERNAL_NOTE"] as const)
  @IsOptional()
  messageType?: "TEXT" | "FILE" | "INTERNAL_NOTE";

  @IsString()
  @IsOptional()
  replyToId?: string;
}
