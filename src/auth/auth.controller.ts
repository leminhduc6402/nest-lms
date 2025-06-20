import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/customize/decorator';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: CreateAuthDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('check-code')
  async checkCode(@Body() codeAuthDto: CodeAuthDto) {
    return this.authService.checkCode(codeAuthDto);
  }

  @Public()
  @Post('retry-active')
  async retryActive(@Body('email') email: string) {
    return this.authService.retryActive(email);
  }
  @Public()
  @Post('retry-password')
  async renewPassword(@Body('email') email: string) {
    return this.authService.retryPassword(email);
  }

  @Public()
  @Post('change-password')
  async changePassword(@Body() changePasswordAuthDto: ChangePasswordAuthDto) {
    return this.authService.renewPassword(changePasswordAuthDto);
  }

  @Public()
  @Get('mail')
  sendEmail() {
    this.mailerService.sendMail({
      to: 'ducprotc456@gmail.com', // list of receivers
      // from: 'noreply@nestjs.com', // sender address
      subject: 'Testing Nest MailerModule ✔', // Subject line
      text: 'welcome', // plaintext body
      template: 'register', // HTML body content
      context: {
        name: 'Le Minh Duc',
        activationCode: 12312312312,
      },
    });
    return 'Email Sent Successfully!';
  }
}
