import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException();
    }
    const isValidPassword = await this.usersService.isValidPassword(
      user.password,
      pass,
    );
    if (isValidPassword) {
      throw new UnauthorizedException('Username or Password is incorrect');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    // TODO: Generate a JWT and return it here
    // instead of the user object
    const payload = { sub: user._id, email: user.email, name: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
