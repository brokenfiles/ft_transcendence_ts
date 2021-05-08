import {Injectable} from "@nestjs/common";
import {Guild} from "./entities/guild.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CreateGuildDto} from "./dto/create-guild.dto";

@Injectable()
export class GuildsService {
    constructor(@InjectRepository(Guild) private guildRepository : Repository<Guild>) {}

    findAll() : Promise<Guild[]> {
        return this.guildRepository.find({
            relations: [
                'users'
            ]
        })
    }

    findOne(id: number) : Promise<Guild> {
        return this.guildRepository.findOne(id, {
            relations: [
                'users'
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

}
