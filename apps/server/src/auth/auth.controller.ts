// apps/backend/src/auth/auth.controller.ts
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { type Response } from 'express'
import { JwtAuthGuard } from '../common/gaurds/jwt-auth.guard'
import { CurrentUser } from '../common/decorator/current-user.decorator'

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
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user){
    return this.authService.me(user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Res({passthrough: true}) response: Response) {
    return this.authService.logout(response);
  }
}