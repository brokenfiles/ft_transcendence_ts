import {Injectable} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {User} from "./entities/user.entity";
import {Guild} from "../guilds/entities/guild.entity";
import {validate} from "class-validator";

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {
    }

    create(createUser: CreateUserDto): Promise<User> {
        const newUser = this.usersRepository.create(createUser)
        return this.usersRepository.save(newUser)
    }

    findAll(): Promise<User[]> {
        return this.usersRepository.find({
            relations: [
                'guild'
            ]
        })
    }

    findOne(id: number): Promise<User> {
        return this.usersRepository.findOne(id, {
            relations: [
                'guild'
            ]
        })
    }

    findByDisplayName(displayName: string) : Promise<User | undefined> {
        return this.usersRepository.findOne({
            where: {display_name: displayName},
            relations: ['guild']
        })
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        await this.usersRepository.update(id, updateUserDto)
        return this.findOne(id)
    }

    async remove(id: number): Promise<User> {
        const user = await this.findOne(id)
        return this.usersRepository.remove(user)
    }
}
