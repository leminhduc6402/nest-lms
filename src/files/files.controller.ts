import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseMessage, User } from 'src/customize/decorator';
import { IUser } from 'src/users/user.interface';
import { UpdateFileDto } from './dto/update-file.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}
  // new ParseFilePipeBuilder()
  //   .addFileTypeValidator({
  //     // fileType: /^(jpg|jpeg|image|\/png|gif|txt|pdf|application\/pdf|doc|docx|text|\/plain)$/i,
  //     fileType:
  //       /^(jpg|jpeg|image|\/png|gif|txt|pdf|application\/pdf|doc|docx|text|\/plain)$/i,
  //   })
  //   .addMaxSizeValidator({
  //     maxSize: 1024 * 1024 * 5, // 5MB
  //   })
  //   .build({
  //     errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  //   }),
  @Post('upload')
  @ResponseMessage('Upload single file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @User() user: IUser,
  ) {
    return await this.filesService.create(file, user);
  }

  // @Post()
  // create(@Body() createFileDto: CreateFileDto) {
  //   return this.filesService.create(createFileDto);
  // }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}
