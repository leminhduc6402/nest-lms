import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import mongoose, { Model } from 'mongoose';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';
import dayjs from 'dayjs';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
  ) {}
  async create(createLessonDto: CreateLessonDto, user: IUser) {
    return await this.lessonModel.create({
      ...createLessonDto,
      createdBy: user._id,
    });
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.lessonModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const results = await this.lessonModel
      .find(filter)
      // .select('-password -refreshToken')
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      results,
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Can not found this lesson');
    }
    return await this.lessonModel.findById(id);
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Can not found this lesson');
    }
    const lesson = await this.lessonModel.findById(id);

    const isPermission = lesson.createdBy.toString() === user._id;
    if (!isPermission) {
      throw new BadRequestException('You do not have permission');
    }
    return await lesson.updateOne({ ...updateLessonDto, updatedBy: user._id });
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Can not found this lesson');
    }
    const lesson = await this.lessonModel.findById(id);

    const isPermission = lesson.createdBy.toString() === user._id;
    if (!isPermission) {
      throw new BadRequestException('You do not have permission');
    }
    return await lesson.updateOne({
      deletedBy: user._id,
      isDeleted: true,
      deletedAt: dayjs(),
    });
  }
}
