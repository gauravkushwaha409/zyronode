// apps/server/src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AuthJwtService } from './jwt.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import * as bcryptjs from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private authJwtService: AuthJwtService,
  ) { }

  private async hashPassword(password: string) {
    return await bcryptjs.hash(password, 10)
  }

  async getTokens(user: { id: string; email: string; firstName: string | null; lastName: string | null }) {
    const payload = {
      id: user.id,
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    };

    return this.authJwtService.generateAuthTokens(payload);
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
    return this.getTokens(user)
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
    const isPasswordValid = await bcryptjs.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const tokens = await this.getTokens(user);
    return {  user,tokens };
  }

}