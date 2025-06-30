import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) return null;
    const isValidPassword = await this.usersService.isValidPassword(
      pass,
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Username or Password is incorrect');
    }
    return user;
  }

  async login(user: any) {
    const payload = { sub: user._id, email: user.email, name: user.name };

    return {
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
        _id: user._id,
      },
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(registerDto: CreateAuthDto) {
    return await this.usersService.handleRegister(registerDto);
  }

  async checkCode(codeAuthDto: CodeAuthDto) {
    return await this.usersService.handleActivateAccount(codeAuthDto);
  }

  async retryActive(email: string) {
    return await this.usersService.retryActive(email);
  }
  async retryPassword(email: string) {
    return await this.usersService.retryPassword(email);
  }

  async renewPassword(changePasswordAuthDto: ChangePasswordAuthDto) {
    return await this.usersService.renewPassword(changePasswordAuthDto);
  }
}
