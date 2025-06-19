import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import dayjs from 'dayjs';
import mongoose, { Model } from 'mongoose';
import { CodeAuthDto, CreateAuthDto } from 'src/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly mailerService: MailerService,
  ) {}

  hashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async findOneByEmail(email: string) {
    return await this.userModel.findOne({
      email,
    });
  }

  async create(createUserDto: CreateUserDto) {
    const isExist = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (isExist) {
      throw new BadRequestException(
        `Email: ${createUserDto.email} already exists`,
      );
    }
    const hashPassword = this.hashPassword(createUserDto.password);
    const newUser = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
    });
    return newUser;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const results = await this.userModel
      .find(filter)
      .select('-password -refreshToken')
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      results, //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Can not found this user');
    }
    const user = await this.userModel
      .findById(id)
      .select('-password -refreshToken');

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Can not found this user');
    }
    return await this.userModel.findByIdAndDelete(id).exec();
  }

  async handleRegister(createUserDto: CreateAuthDto) {
    const { email } = createUserDto;
    const isExist = await this.userModel.findOne({
      email: email,
    });
    if (isExist) {
      throw new BadRequestException(`Email: ${email} already exists`);
    }
    const hashPassword = this.hashPassword(createUserDto.password);
    const codeID = uuidv4();
    const newUser = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
      isActive: false,
      codeID: codeID,
      codeExpiration: dayjs().add(5, 'minutes'),
    });

    this.mailerService.sendMail({
      to: email,
      subject: 'Activate Your Account',
      text: 'welcome',
      template: 'register',
      context: {
        name: createUserDto.name,
        activationCode: codeID,
      },
    });

    return newUser;
  }

  handleActivateAccount = async (codeAuthDto: CodeAuthDto) => {
    const user = await this.userModel.findOne({
      _id: codeAuthDto._id,
      codeID: codeAuthDto.code,
    });
    if (!user) {
      throw new NotFoundException('Code expired or invalid');
    }
    const isBeforeExpiration = dayjs().isBefore(user.codeExpiration);
    if (isBeforeExpiration) {
      await this.userModel.updateOne(
        { _id: user._id },
        {
          isActive: true,
        },
      );
      return { isBeforeExpiration };
    } else {
      throw new BadRequestException('Code expired');
    }
  };
}
