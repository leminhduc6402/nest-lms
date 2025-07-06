import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateSectionDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsMongoId()
  courseId: mongoose.Schema.Types.ObjectId;
}
