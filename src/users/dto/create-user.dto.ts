import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

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
  enrolledCourses: mongoose.Schema.Types.ObjectId[];

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
