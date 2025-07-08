import { IsNotEmpty } from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  fileUrl: string;

  @IsNotEmpty()
  order: number;
}
