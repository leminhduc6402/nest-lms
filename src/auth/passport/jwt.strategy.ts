import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_ACCESS_TOKEN'),
    });
  }

  async validate(payload: any) {
    console.log('>> JwtStrategy validate payload:', payload);
    const { _id, email, name } = payload;
    return {
      _id,
      email,
      name,
    };
  }
}
