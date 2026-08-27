import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SendOtpDto } from "./dto/send-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { OtpService } from "./otp.service";

@ApiTags("OTP")
@Controller("otp")
export class OtpController {
	constructor(private otpService: OtpService) {}

	@Post("send")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Send OTP to email' })
	@ApiResponse({ status: 200, description: 'OTP sent successfully' })
	sendOtp(@Body() dto: SendOtpDto) {
		return this.otpService.generateAndSendOtp(dto.email);
	}

	@Post("verify")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Verify OTP code' })
	@ApiResponse({ status: 200, description: 'OTP verified' })
	@ApiResponse({ status: 400, description: 'Invalid OTP' })
	verifyOtp(@Body() dto: VerifyOtpDto) {
		return this.otpService.verifyOtp(dto.email, dto.code);
	}
}
