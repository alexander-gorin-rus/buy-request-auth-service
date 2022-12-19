import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { IJwtCustomParams } from './interfaces/auth.interface';

@Injectable()
export class TokenService {
  constructor(private readonly configService: ConfigService) {}

  private encodeToken(payload: any): string {
    return jwt.sign(payload, this.configService.get('jwtSecretKey'));
  }

  createCustomJwt(
    email: string,
    id: string,
    ...params: IJwtCustomParams
  ): string {
    const newTokenPayload = {
      email: email,
      emailVerified: true,
      id: id,
      ...(params &&
        params.reduce((acc, { key, value }) => {
          acc[key] = value;
          return acc;
        }, {})),
    };
    return this.encodeToken(newTokenPayload);
  }
}
