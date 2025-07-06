import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Section } from 'src/sections/schemas/section.schema';
import { User } from 'src/users/schemas/user.schema';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
  @Prop({ require: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  thumbnail: string;

  @Prop()
  price: number;

  @Prop()
  category: string;

  @Prop()
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  teacherId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Section.name })
  sectionId: mongoose.Schema.Types.ObjectId[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  createdBy: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  updatedBy: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  deletedBy: mongoose.Schema.Types.ObjectId;

  @Prop()
  isDeleted: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
