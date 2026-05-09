// apps/backend/src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'
import type { RegisterDto } from './dto/register.dto'
import type { LoginDto } from './dto/login.dto'


@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    if (exists) throw new ConflictException('Email already in use')

    const hashed = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
      },
    })

    const { password: _, ...result } = user
    return {
      user: result,
      token: this.signToken(user.id, user.email),
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, user.password)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    const { password: _, ...result } = user
    return {
      user: result,
      token: this.signToken(user.id, user.email),
    }
  }

private signToken(userId: string, email: string) {
  return this.jwt.sign(
    { sub: userId, email },
    {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d'
    },
  )
}
}