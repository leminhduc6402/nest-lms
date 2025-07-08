import { IsArray, IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';
import { CreateLessonDto } from 'src/lessons/dto/create-lesson.dto';

export class CreateSectionDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsMongoId({ each: true })
  @IsArray()
  lessons: CreateLessonDto[];

  @IsNotEmpty()
  @IsNumber()
  order: number;
}
