import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { CreateSectionDto } from 'src/sections/dto/create-section.dto';

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

  @IsOptional()
  @IsMongoId({ each: true })
  @IsArray()
  sections: CreateSectionDto[];
}
