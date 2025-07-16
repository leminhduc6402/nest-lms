import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { CreateLessonDto } from 'src/lessons/dto/create-lesson.dto';

export class CreateSectionDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsMongoId({ each: true })
  @IsArray()
  lessons: CreateLessonDto[];

  @IsNotEmpty()
  @IsNumber()
  order: number;
}
