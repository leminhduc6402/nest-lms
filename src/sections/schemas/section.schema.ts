import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Lesson } from 'src/lessons/schemas/lesson.schema';
import { User } from 'src/users/schemas/user.schema';

export type SectionDocument = HydratedDocument<Section>;

@Schema({ timestamps: true })
export class Section {
  @Prop()
  name: string;

  @Prop({ type: { type: [mongoose.Schema.Types.ObjectId], ref: Lesson.name } })
  lessonId: Lesson[];

  @Prop()
  order: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: User.name } })
  createdBy: mongoose.Schema.Types.ObjectId;

  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: User.name } })
  updatedBy: mongoose.Schema.Types.ObjectId;

  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: User.name } })
  deletedBy: mongoose.Schema.Types.ObjectId;

  @Prop()
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const SectionSchema = SchemaFactory.createForClass(Section);
