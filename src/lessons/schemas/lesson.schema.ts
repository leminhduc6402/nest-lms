import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Section } from 'src/sections/schemas/section.schema';
import { User } from 'src/users/schemas/user.schema';

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({ timestamps: true })
export class Lesson {
  @Prop()
  title: string;

  @Prop()
  status: string;

  @Prop()
  fileUrl: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Section.name })
  sectionId: mongoose.Types.ObjectId;

  @Prop()
  order: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }] })
  createdBy: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }] })
  updatedBy: mongoose.Schema.Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: User.name }] })
  deletedBy: mongoose.Schema.Types.ObjectId;

  @Prop()
  isDeleted: boolean;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
