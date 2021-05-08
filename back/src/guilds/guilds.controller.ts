import {Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
import {CreateGuildDto} from "./dto/create-guild.dto";
import {GuildsService} from "./guilds.service";

@Controller('guilds')
export class GuildsController {

    constructor(private readonly guildService : GuildsService) {}

    @Post()
    async create(@Body() createGuild : CreateGuildDto){
        await this.guildService.create(createGuild)
    }

    @Get()
    findAll() {
        return this.guildService.findAll()
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.guildService.remove(+id)
    }

}
