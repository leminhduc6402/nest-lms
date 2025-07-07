import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from 'src/users/user.interface';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileDocument } from './schemas/file.schema';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File.name)
    private fileModel: Model<FileDocument>,
    private configService: ConfigService,
  ) {}
  async create(file: Express.Multer.File, user: IUser) {
    const { filename, originalname, size, mimetype } = file;
    console.log(file);
    return await this.fileModel.create({
      originalName: originalname,
      fileName: filename,
      mimetype,
      size,
      path: this.configService.get('BASE_URL') + '/files/test/' + filename,
      createdBy: user._id,
    });
  }

  findAll() {
    return `This action returns all files`;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
