import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {Guild} from "./entities/guild.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CreateGuildDto} from "./dto/create-guild.dto";
import {UpdateGuildDto} from "./dto/update-guild.dto";
import {UsersService} from "../users/users.service";

@Injectable()
export class GuildsService {
    constructor(@InjectRepository(Guild) private guildRepository : Repository<Guild>,
                private usersService: UsersService) {}

    findAll() : Promise<Guild[]> {
        return this.guildRepository.find({
            relations: [
                'users', 'owner'
            ]
        }).catch((err) => {
            throw new HttpException({
                error: err.message
            }, HttpStatus.BAD_REQUEST)
        })
    }

    findOne(id: number) : Promise<Guild> {
        return this.guildRepository.findOne(id, {
            relations: [
                'users', 'owner'
            ]
        }).catch((err) => {
            throw new HttpException({
                error: err.message
            }, HttpStatus.BAD_REQUEST)
        })
    }

    async create(subOwner: number, createGuild: CreateGuildDto) : Promise<Guild> {
        const user = await this.usersService.findOne(subOwner)
        createGuild.owner = user
        createGuild.users = [user]
        const newGuild = this.guildRepository.create(createGuild)
        return this.guildRepository.save(newGuild)
            .catch(() => {
                throw new HttpException({
                    message: [
                        `Can't create a new guild. Maybe requester has already a guild`
                    ]
                }, HttpStatus.BAD_REQUEST)
            })
    }

    async remove(id: number) : Promise<Guild> {
        const guild = await this.findOne(id)
        return (this.guildRepository.remove(guild))
    }

    async update(id: number, updateGuild: UpdateGuildDto) : Promise<Guild> {
        let guild = await this.findOne(id)
        Object.assign(guild, updateGuild)
        return this.guildRepository.save(guild)
            .catch((err) => {
                throw new HttpException({
                    error: err.message
                }, HttpStatus.BAD_REQUEST)
            })
    }

    findByAnagram(anagram) {
        return this.guildRepository.findOneOrFail({
            where: {anagram},
            relations: ['users', 'owner']
        }).catch(() => {
            throw new HttpException({
                message: [
                  `This guild does not exist`
                ]
            }, HttpStatus.BAD_REQUEST)
        })
    }

    /**
     * Leave the guild
     * Deletes the guild if the user is the owner
     * @param {number} sub
     */
    async leave(sub: number): Promise<Guild> {
        let user = await this.usersService.findOne(sub)
        let guild = user.guild
        if (guild.owner.id === user.id) {
            guild.users = []
            guild.owner = null
        } else {
            const index = guild.users.map(u => u.id).indexOf(sub)
            if (index === -1)
                throw new HttpException({
                    message: [
                        'You are not part of your own guild. wait what ?'
                    ]
                }, HttpStatus.BAD_REQUEST)
            guild.users.splice(index, 1)
        }
        if (guild.users.length > 0) {
            return this.guildRepository.save(guild)
        } else {
            return this.guildRepository.remove(guild)
        }
    }
}
