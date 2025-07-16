import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import mongoose, { Model } from 'mongoose';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';
import dayjs from 'dayjs';
import { SectionsService } from 'src/sections/sections.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
    private readonly sectionService: SectionsService,
  ) {}

  async create(createCourseDto: CreateCourseDto, user: IUser) {
    const { sections, ...newCreateCourseDto } = createCourseDto;

    const course = await this.courseModel.create({
      ...newCreateCourseDto,
      sectionId: [],
      teacherId: user._id,
      createdBy: user._id,
      updatedBy: user._id,
    });
    if (sections.length !== 0) {
      const sectionIds = [];
      for (const item of sections || []) {
        const lesson = await this.sectionService.create(item, user);
        sectionIds.push(lesson._id);
      }

      course.sectionId = sectionIds;
      await course.save();
    }

    return course;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.courseModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const results = await this.courseModel
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
      throw new NotFoundException('Can not found this course');
    }
    const course = await this.courseModel.findById(id).populate({
      path: 'teacherId',
      select: { email: 1, name: 1, image: 1 },
    });
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, user: IUser) {
    const course = await this.courseModel.findById(id);

    const isPermission =
      course.createdBy.toString() === user._id ? true : false;

    if (!isPermission) {
      throw new BadRequestException('You do not have permission');
    }

    return await course.updateOne({ ...updateCourseDto, updatedBy: user._id });
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Can not found this course');
    }
    const course = await this.courseModel.findById(id);

    const isPermission =
      course.createdBy.toString() === user._id ? true : false;

    if (!isPermission) {
      throw new BadRequestException('You do not have permission');
    }
    return await course.updateOne({
      deletedBy: user._id,
      isDeleted: true,
      deletedAt: dayjs(),
    });
  }
}
