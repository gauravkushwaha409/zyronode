import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
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
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async issueAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      
    });
  }

  async issueRefreshToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      // Optional: you can define a different secret for refresh tokens here
      // secret: process.env.JWT_REFRESH_SECRET
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
