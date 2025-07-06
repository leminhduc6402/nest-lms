import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  role: string;

  @IsOptional()
  enrolledCourses: string;

  @IsOptional()
  accountType: string;

  @IsOptional()
  image: string;

  @IsOptional()
  isActive: boolean;

  @IsOptional()
  codeID: string;

  @IsOptional()
  codeExpiration: Date;
}
