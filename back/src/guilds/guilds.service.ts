import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {Guild} from "./entities/guild.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CreateGuildDto} from "./dto/create-guild.dto";
import {UpdateGuildDto} from "./dto/update-guild.dto";
import {UsersService} from "../users/users.service";
import {JoinGuildDto} from "./dto/join-guild.dto";
import {User} from "../users/entities/user.entity";

@Injectable()
export class GuildsService {
    constructor(@InjectRepository(Guild) private guildRepository : Repository<Guild>,
                private usersService: UsersService) {}

    async findAll() : Promise<Guild[]> {

        let guilds = await this.guildRepository.find({
            relations: [
                'users', 'owner'
            ]
        })
        for (let guild of guilds) {
            guild.points = guild.users.map(u => u.points).reduce((acc, curr) => acc + curr)
        }
        return guilds
    }

    async findAllOrderedByPoints(): Promise<Guild[]> {
        let guilds = await this.findAll()
        guilds.sort((a, b) => a.points > b.points ? 1 : -1)
        return guilds.slice(0, 15)
    }

    async findOne(id: number) : Promise<Guild> {
        let guild = await this.guildRepository.findOne(id, {
            relations: [
                'users', 'owner', 'pending_users'
            ]
        }).catch((err) => {
            throw new HttpException({
                error: err.message
            }, HttpStatus.BAD_REQUEST)
        })
        guild.points = guild.users.map(u => u.points).reduce((acc, curr) => acc + curr)
        return guild
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
                        `Something went wrong when we tried to create your guild. Be sure that no other guild has the same name or anagram and that you does not have a guild`
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

    async findByAnagram(anagram) {
        let guild = await this.guildRepository.findOneOrFail({
            where: {anagram},
            relations: ['users', 'owner', 'pending_users']
        }).catch(() => {
            throw new HttpException({
                message: [
                  `This guild does not exist`
                ]
            }, HttpStatus.BAD_REQUEST)
        })
        guild.points = guild.users.map(u => u.points).reduce((acc, curr) => acc + curr)
        return guild
    }

    /**
     * Leave the guild
     * Deletes the guild if the user is the owner
     * @param {number} sub
     */
    async leave(sub: number): Promise<Guild> {
        let user = await this.usersService.findOne(sub)
        let guild: Guild = await this.findOne(user.guild.id)
        if (guild.owner.id === user.id) {
            return this.guildRepository.remove(guild)
        } else {
            //TODO: à tester : le leave
            const index = guild.users.map(u => u.id).indexOf(sub)
            if (index === -1)
                throw new HttpException({
                    message: [
                        'You are not part of your own guild. wait what ?'
                    ]
                }, HttpStatus.BAD_REQUEST)
            guild.users.splice(index, 1)
            return this.guildRepository.save(guild)
        }
    }

    async joinOrRequestGuild(sub: number, joinGuild: JoinGuildDto) {
        let user = await this.usersService.findOne(sub)
        let guild = await this.findOne(joinGuild.guild.id)
        if (guild.users.length >= guild.max_users)
            throw new HttpException({
                message: ['The guild is full']
            }, HttpStatus.BAD_REQUEST)
        const ids = guild.users.map(u => u.id)
        if (ids.includes(user.id))
            throw new HttpException({
                message: [
                    'You are already in this guild'
                ]
            }, HttpStatus.BAD_REQUEST)
        if (guild.open) {
            guild.users.push(user)
        } else {
            if (guild.pending_users) {
                if (!guild.pending_users.map(u => u.id).includes(user.id))
                    guild.pending_users.push(user)
            }
            else
                guild.pending_users = [user]
        }
        return this.guildRepository.save(guild)
    }

    async cancelRequest(sub: number): Promise<User> {
        return this.usersService.cancelGuildRequest(sub)
    }

    async editRequest(sub: number, requester: User, accept: boolean) {
        const acceptor = await this.usersService.findOne(sub)
        if (!acceptor.guild)
            throw new HttpException({
                message: [
                    `You don't have a guild`
                ]
            }, HttpStatus.BAD_REQUEST)
        let acceptorGuild = await this.findOne(acceptor.guild.id)
        if (acceptor.id !== acceptorGuild.owner.id)
            throw new HttpException({
                message: [
                    `You can't accept this user`
                ]
            }, HttpStatus.BAD_REQUEST)
        requester = await this.usersService.findOne(requester.id)
        if (!requester.guild_request || requester.guild_request.id !== acceptorGuild.id)
            throw new HttpException({
                message: [
                    `This user does not have a request for this guild`
                ]
            }, HttpStatus.BAD_REQUEST)
        if (requester.guild)
            throw new HttpException({
                message: [
                    `This user has already a guild`
                ]
            }, HttpStatus.BAD_REQUEST)

        if (accept) {
            // if the user has accepted the request
            acceptorGuild.users.push(requester)
        }
        const index = acceptorGuild.pending_users.map(u => u.id).indexOf(requester.id)
        acceptorGuild.pending_users.splice(index, 1)
        return await this.guildRepository.save(acceptorGuild)
    }

    /**
     * Kick a user from a guild
     * @param {number} sub
     * @param {User} user
     */
    async kickUser(sub: number, user: User) {
        if (sub === user.id)
            throw new HttpException({
                message: [
                    `You can't kick yourself`
                ]
            }, HttpStatus.BAD_REQUEST)
        const kicker = await this.usersService.findOne(sub)
        if (!kicker || !kicker.guild)
            throw new HttpException({
                message: [
                    `This user or this guild does not exist`
                ]
            }, HttpStatus.BAD_REQUEST)
        let guild = await this.findOne(kicker.guild.id)
        if (!guild)
            throw new HttpException({
                message: [
                    `The user does not have a guild`
                ]
            }, HttpStatus.BAD_REQUEST)
        const idx = guild.users.map(u => u.id).indexOf(user.id)
        if (idx === -1)
            throw new HttpException({
                message: [
                    `This user is not in this guild`
                ]
            }, HttpStatus.BAD_REQUEST)
        guild.users.splice(idx, 1)
        return this.guildRepository.save(guild)
    }

    async updateMine(sub: number, updateGuild: UpdateGuildDto): Promise<Guild> {
        const user = await this.usersService.findOne(sub)
        if (!user.guild)
            throw new HttpException({
                message: [`You don't have a guild`]
            }, HttpStatus.BAD_REQUEST)
        let guild = await this.findOne(user.guild.id)
        if (guild.owner.id !== user.id)
            throw new HttpException({
                message: [`You can't update the guild unless you're owner`]
            }, HttpStatus.UNAUTHORIZED)
        Object.assign(guild, updateGuild)
        return this.guildRepository.save(guild)
            .catch((err) => {
                throw new HttpException({
                    error: err.message
                }, HttpStatus.BAD_REQUEST)
            })
    }
}
