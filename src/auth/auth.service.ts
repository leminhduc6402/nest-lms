import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    const isValidPassword = await this.usersService.isValidPassword(
      user.password,
      pass,
    );
    if (isValidPassword) {
      throw new UnauthorizedException('Username or Password is incorrect');
    }
    if (!user) {
      return null;
    }

    return user;
  }
  async login(user: any) {
    const payload = { sub: user._id, email: user.email, name: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
