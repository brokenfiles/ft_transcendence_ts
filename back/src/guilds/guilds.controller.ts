import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {CreateGuildDto} from "./dto/create-guild.dto";
import {GuildsService} from "./guilds.service";
import {UpdateGuildDto} from "./dto/update-guild.dto";

@Controller('guilds')
export class GuildsController {

    constructor(private readonly guildService : GuildsService) {}

    @Post()
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
    update(@Param('id') id: number, @Body() updateGuild : UpdateGuildDto) {
        return this.guildService.update(+id, updateGuild)
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.guildService.remove(+id)
    }

}
