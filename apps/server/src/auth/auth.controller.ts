// apps/backend/src/auth/auth.controller.ts
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { type Response } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Res({passthrough: true}) response: Response) {
    return this.authService.register(dto, response)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Res({passthrough: true}) response: Response) {
    return this.authService.login(dto, response)
  }

  @Get('me')
  me(){
    return this.authService.me();
  }
}