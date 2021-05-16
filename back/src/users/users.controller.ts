import {Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus} from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from "express";
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {GuildsService} from "../guilds/guilds.service";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly guildsService : GuildsService) {}

  // @Post()
  // async create(@Body() createUser: CreateUserDto) {
  //   return this.usersService.create(createUser)
  // }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

