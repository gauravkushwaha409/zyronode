import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface TokenPayload {
  id: string;
}

export interface AdminTokenPayload {
  id: string;
  scope: 'admin';
}

@Injectable()
export class AuthJwtService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAuthTokens(payload: TokenPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.issueAccessToken(payload),
      this.issueRefreshToken(payload),
    ]);

    return {
      access: accessToken,
      refresh: refreshToken,
    };
  }

  async generateAdminTokens(payload: Pick<TokenPayload, 'id'>) {
    const adminPayload: AdminTokenPayload = { id: payload.id, scope: 'admin' };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(adminPayload, {
        expiresIn: '24h',
        subject: 'admin_access',
      }),
      this.jwtService.signAsync(adminPayload, {
        expiresIn: '24h',
        subject: 'admin_refresh',
      }),
    ]);

    return {
      access: accessToken,
      refresh: refreshToken,
    };
  }

  async issueAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      subject: 'access',
    });
  }

  async issueRefreshToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      subject: 'refresh',
    });
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      // verifyAsync validates the signature and the expiration
      return await this.jwtService.verifyAsync<TokenPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  extractInformation(token: string): TokenPayload | null {
    // decode only extracts the payload without verifying the signature
    return this.jwtService.decode(token) as TokenPayload | null;
  }
}
