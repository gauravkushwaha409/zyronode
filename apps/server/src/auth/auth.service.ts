// apps/backend/src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import * as bcryptjs from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) { }

  private async hashPassword(password: string) {
    return await bcryptjs.hash(password, 10)
  }

  async register(dto: RegisterDto) {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: await this.hashPassword(dto.password),
        firstName: dto.firstName,
        lastName: dto.lastName,
        profile: dto.profile,
      },
    })
    return user
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    })
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    if (user.password !== dto.password) {
      throw new UnauthorizedException('Invalid credentials')
    }
    return {
      access_token: this.jwt.sign({ email: user.email }),
    }
  }

}