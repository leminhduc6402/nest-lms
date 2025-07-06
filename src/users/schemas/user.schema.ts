import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Course } from 'src/courses/schemas/course.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ default: 'USER' })
  role: string; // e.g., 'student', 'teacher', 'admin'

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Course.name })
  enrolledCourses: mongoose.Schema.Types.ObjectId[]; //

  @Prop()
  image: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: 'LOCAL' })
  accountType: string;

  @Prop()
  codeID: string;

  @Prop()
  codeExpiration: Date;

  @Prop()
  refreshToken: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  createdBy: mongoose.Schema.Types.ObjectId;

  @Prop()
  updatedBy: mongoose.Schema.Types.ObjectId;

  @Prop()
  deletedBy: mongoose.Schema.Types.ObjectId;

  @Prop()
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
