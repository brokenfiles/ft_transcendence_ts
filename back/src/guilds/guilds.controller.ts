import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException, HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
    UseGuards
} from '@nestjs/common';
import {CreateGuildDto} from "./dto/create-guild.dto";
import {GuildsService} from "./guilds.service";
import {UpdateGuildDto} from "./dto/update-guild.dto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {Roles} from "../auth/roles/roles.decorator";
import {Role} from "../auth/roles/enums/role.enum";
import {RolesGuard} from "../auth/roles/roles.guard";
import {Request} from "express";
import {JoinGuildDto} from "./dto/join-guild.dto";
import {AcceptUserDto} from "./dto/accept-user.dto";
import {KickUserDto} from "./dto/kick-user.dto";

@Controller('guilds')
export class GuildsController {

    constructor(private readonly guildService : GuildsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Req() request, @Body() createGuild : CreateGuildDto){
        return this.guildService.create(request.user.sub, createGuild)
    }

    @Get()
    findAll(@Req() req: Request) {
        if (req.query.anagram)
            return this.guildService.findByAnagram(req.query.anagram)
        return this.guildService.findAll()
    }

    @Get(":id")
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.guildService.findOne(id)
    }

    @Patch("mine")
    @UseGuards(JwtAuthGuard)
    updateMine(@Req() request, @Body() updateGuild: UpdateGuildDto) {

    }

    @Post("mine/leave")
    @UseGuards(JwtAuthGuard)
    leaveGuild(@Req() request) {
        return this.guildService.leave(request.user.sub)
    }

    @Post("mine/accept")
    @UseGuards(JwtAuthGuard)
    acceptRequest(@Req() request, @Body() acceptUser: AcceptUserDto) {
        return this.guildService.editRequest(request.user.sub, acceptUser.requester, true)
    }

    @Post("mine/deny")
    @UseGuards(JwtAuthGuard)
    denyRequest(@Req() request, @Body() acceptUser: AcceptUserDto) {
        return this.guildService.editRequest(request.user.sub, acceptUser.requester, false)
    }

    @Delete("mine/user")
    @UseGuards(JwtAuthGuard)
    kickUser(@Req() request, @Body() kickUser: KickUserDto) {
        return this.guildService.kickUser(request.user.sub, kickUser.user)
    }

    @Delete('request')
    @UseGuards(JwtAuthGuard)
    cancelGuildRequest(@Req() request) {
        return this.guildService.cancelRequest(request.user.sub)
    }

    @Post("join")
    @UseGuards(JwtAuthGuard)
    joinOrRequest(@Req() request, @Body() joinGuild: JoinGuildDto) {
        return this.guildService.joinOrRequestGuild(request.user.sub, joinGuild)
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Moderator, Role.Administrator)
    update(@Param('id') id: number, @Body() updateGuild : UpdateGuildDto) {
        return this.guildService.update(+id, updateGuild)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Moderator, Role.Administrator)
    remove(@Param('id') id: number) {
        return this.guildService.remove(+id)
    }

}
