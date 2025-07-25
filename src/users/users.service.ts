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
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from 'src/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { IUser } from './user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
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

  async create(createUserDto: CreateUserDto, user: IUser) {
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
      createdBy: user._id,
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
      throw new NotFoundException('Can not found this user');
    }
    const user = await this.userModel
      .findById(id)
      .select('-password -refreshToken');

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...newUpdateUserDto } = updateUserDto;
    return await this.userModel.findByIdAndUpdate(
      id,
      { ...newUpdateUserDto, updatedBy: user._id },
      {
        new: true,
      },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'not found user';
    }
    const foundUser = await this.userModel.findById(id);
    if (
      foundUser &&
      foundUser.email === this.configService.get<string>('ADMIN_EMAIL')
    )
      throw new BadRequestException(
        'You do not have enough permission to remove this account',
      );

    const userDeleted = await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: user._id,
        isDeleted: true,
        deletedAt: dayjs(),
      },
    );
    return userDeleted;
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

  async retryActive(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    if (user.isActive) {
      throw new BadRequestException('User is already active');
    }
    const codeID = uuidv4();
    this.mailerService.sendMail({
      to: email,
      subject: 'Activate Your Account',
      text: 'welcome',
      template: 'register',
      context: {
        name: user.name ?? user.email,
        activationCode: codeID,
      },
    });
    await user.updateOne({
      codeID,
      codeExpiration: dayjs().add(5, 'minutes'),
    });
    return { _id: user._id };
  }

  async retryPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    const codeID = uuidv4();
    this.mailerService.sendMail({
      to: email,
      subject: 'Change Your Password',
      text: 'welcome',
      template: 'register',
      context: {
        name: user.name ?? user.email,
        activationCode: codeID,
      },
    });
    await user.updateOne({
      codeID,
      codeExpiration: dayjs().add(5, 'minutes'),
    });
    return { _id: user._id, email: user.email };
  }

  async renewPassword(changePasswordAuthDto: ChangePasswordAuthDto) {
    const { email, code, password, confirmPassword } = changePasswordAuthDto;
    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password and Confirm Password do not match',
      );
    }
    const user = await this.userModel.findOne({ email, codeID: code });
    if (!user) {
      throw new NotFoundException(
        `User with email ${email} not found or code is invalid`,
      );
    }

    const isBeforeExpiration = dayjs().isBefore(user.codeExpiration);
    if (isBeforeExpiration) {
      const newPassword = await this.hashPassword(password);
      await user.updateOne({
        password: newPassword,
      });
      return { isBeforeExpiration };
    } else {
      throw new BadRequestException('Code expired');
    }
  }
}
