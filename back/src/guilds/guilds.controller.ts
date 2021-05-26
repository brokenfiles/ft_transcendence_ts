import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {CreateGuildDto} from "./dto/create-guild.dto";
import {GuildsService} from "./guilds.service";
import {UpdateGuildDto} from "./dto/update-guild.dto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@Controller('guilds')
export class GuildsController {

    constructor(private readonly guildService : GuildsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createGuild : CreateGuildDto){
        return this.guildService.create(createGuild)
    }

    @Get()
    findAll() {
        return this.guildService.findAll()
    }

    @Get(":id")
    findOne(@Param('id') id: number) {
        return this.guildService.findOne(id)
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: number, @Body() updateGuild : UpdateGuildDto) {
        return this.guildService.update(+id, updateGuild)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: number) {
        return this.guildService.remove(+id)
    }

}
