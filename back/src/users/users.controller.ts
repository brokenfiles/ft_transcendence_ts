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
  ParseIntPipe
} from '@nestjs/common';
import {Request} from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {GuildsService} from "../guilds/guilds.service";
import {Roles} from "../auth/roles/roles.decorator";
import {Role} from "../auth/roles/enums/role.enum";
import {RolesGuard} from "../auth/roles/roles.guard";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {UpdateMeDto} from "./dto/update-me.dto";
import {IsInt} from "class-validator";

@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // async create(@Body() createUser: CreateUserDto) {
  //   return this.usersService.create(createUser)
  // }

  @Get()
  findAllOrByLogin(@Req() req: Request) {
    if (req.query.login)
      return this.usersService.findByLogin(req.query.login)
    return this.usersService.findAll();
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Administrator)
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

