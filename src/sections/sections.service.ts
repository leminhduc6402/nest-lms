import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { LessonsService } from 'src/lessons/lessons.service';
import { IUser } from 'src/users/user.interface';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Section, SectionDocument } from './schemas/section.schema';
import aqp from 'api-query-params';
import dayjs from 'dayjs';

@Injectable()
export class SectionsService {
  constructor(
    @InjectModel(Section.name)
    private sectionModel: Model<SectionDocument>,
    private readonly lessonService: LessonsService,
  ) {}

  async create(createSectionDto: CreateSectionDto, user: IUser) {
    const { name, order, lessons } = createSectionDto;
    const section = await this.sectionModel.create({
      name,
      order: order,
      lessons: [],
      createdBy: user._id,
    });

    if (Array.isArray(lessons) && lessons.length > 0) {
      const lessonIds = [];

      for (const item of lessons || []) {
        const lesson = await this.lessonService.create(item, user);
        lessonIds.push(lesson._id);
      }

      section.lessonId = lessonIds;
      await section.save();
    }

    return section;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.sectionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const results = await this.sectionModel
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
      throw new NotFoundException('Can not found this section');
    }
    const section = await this.sectionModel.findById(id);
    return section;
  }

  async update(id: string, updateSectionDto: UpdateSectionDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Can not found this section');
    }
    const section = await this.sectionModel.findById(id);

    const isPermission = section.createdBy.toString() === user._id;
    if (!isPermission) {
      throw new BadRequestException('You do not have permission');
    }

    return await section.updateOne({
      ...updateSectionDto,
      updatedBy: user._id,
    });
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Can not found this section');
    }
    const section = await this.sectionModel.findById(id);

    const isPermission = section.createdBy.toString() === user._id;
    if (!isPermission) {
      throw new BadRequestException('You do not have permission');
    }
    return await section.updateOne({
      deletedBy: user._id,
      isDeleted: true,
      deletedAt: dayjs(),
    });
  }
}
