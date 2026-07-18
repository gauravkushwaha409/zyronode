import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { SendOtpDto } from "./dto/send-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { OtpService } from "./otp.service";

@Controller("otp")
export class OtpController {
	constructor(private otpService: OtpService) {}

	@Post("send")
	@HttpCode(HttpStatus.OK)
	sendOtp(@Body() dto: SendOtpDto) {
		return this.otpService.generateAndSendOtp(dto.email);
	}

	@Post("verify")
	@HttpCode(HttpStatus.OK)
	verifyOtp(@Body() dto: VerifyOtpDto) {
		return this.otpService.verifyOtp(dto.email, dto.code);
	}
}
