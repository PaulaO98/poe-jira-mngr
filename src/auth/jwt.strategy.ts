import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.get<string>('JWT_SECRET') || 'change_me',
    });
  }

  validate(payload: JwtPayload) {
    console.log('JWT PAYLOAD =>', payload);
    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}
