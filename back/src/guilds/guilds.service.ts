import {Injectable} from "@nestjs/common";
import {Guild} from "./entities/guild.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CreateGuildDto} from "./dto/create-guild.dto";
import {UpdateGuildDto} from "./dto/update-guild.dto";

@Injectable()
export class GuildsService {
    constructor(@InjectRepository(Guild) private guildRepository : Repository<Guild>) {}

    findAll() : Promise<Guild[]> {
        return this.guildRepository.find({
            relations: [
                'users', 'owner'
            ]
        })
    }

    findOne(id: number) : Promise<Guild> {
        return this.guildRepository.findOne(id, {
            relations: [
                'users', 'owner'
            ]
        })
    }

    create(createGuild: CreateGuildDto) : Promise<Guild> {
        const newGuild = this.guildRepository.create(createGuild)
        return this.guildRepository.save(newGuild)
    }

    async remove(id: number) : Promise<Guild> {
        const guild = await this.findOne(id)
        return (this.guildRepository.remove(guild))
    }

    async update(id: number, updateGuild: UpdateGuildDto) : Promise<Guild> {
        await this.guildRepository.update(id, updateGuild)
        return this.findOne(id)
    }
}
