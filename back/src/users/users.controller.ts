import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  Req,
  ParseIntPipe, HttpException, UseInterceptors, UploadedFile
} from '@nestjs/common';
import {Request, Express} from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {Roles} from "../auth/roles/roles.decorator";
import {Role} from "../auth/roles/enums/role.enum";
import {RolesGuard} from "../auth/roles/roles.guard";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {UpdateMeDto} from "./dto/update-me.dto";
import config from "../../configuration/config";
import {FileInterceptor} from "@nestjs/platform-express";

@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // async create(@Body() createUser: CreateUserDto) {
  //   return this.usersService.create(createUser)
  // }

  @Get()
  async findAllOrByLogin(@Req() req: Request) {
    if (req.query.login) {
      const user = await this.usersService.findByLogin(req.query.login)
      if (!user)
        throw new HttpException({
          message: [
              `This user does not exist`
          ]
        }, HttpStatus.BAD_REQUEST)
      return user
    }
    return this.usersService.findAll();
  }

  @Get('search')
  searchUser(@Req() req: Request) {
    const search = req.query.input as string
    if (!search)
      throw new HttpException({
        error: "You have to provide a search input"
      }, HttpStatus.BAD_REQUEST)
    return this.usersService.searchUser(search)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(+id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Req() request, @Body() updateMeDto: UpdateMeDto) {
    return this.usersService.update(+request.user.sub, updateMeDto)
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  updateMyAvatar(@Req() request, @UploadedFile() file: Express.Multer.File) {

  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Administrator, Role.Moderator)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Administrator)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

