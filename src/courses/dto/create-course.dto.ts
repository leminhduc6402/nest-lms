import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description: string;

  @IsOptional()
  thumbnail: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  category: string;

  @IsNotEmpty()
  status: string;

  // @IsNotEmpty()
  // teacherId: string;

  @IsOptional()
  sectionId: string;
}
