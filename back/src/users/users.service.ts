import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {User} from "./entities/user.entity";
import {UpdateMeDto} from "./dto/update-me.dto";

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

    create(createUser: CreateUserDto): Promise<User> {
        const newUser = this.usersRepository.create(createUser)
        return this.usersRepository.save(newUser)
    }

    findAll(): Promise<User[]> {
        return this.usersRepository.find({
            relations: [
                'guild', 'achievements'
            ]
        })
    }

    findOne(id: number): Promise<User> {
        return this.usersRepository.findOneOrFail(id, {
            relations: [
                'guild', 'achievements'
            ]
        }).catch((err) => {
            throw new HttpException({
                error: err.message
            }, HttpStatus.BAD_REQUEST)
        })
    }

    findByLogin(login) : Promise<User | undefined> {
        return this.usersRepository.findOne({
            where: {login: login},
            relations: ['guild', 'achievements']
        })
    }

    async update(id: number, updateUserDto: UpdateUserDto | UpdateMeDto) {
        let user = await this.findOne(id)
        Object.assign(user, updateUserDto)
        return this.usersRepository.save(user)
            .catch((err) => {
                throw new HttpException({
                    error: err.message
                }, HttpStatus.BAD_REQUEST)
            })
    }

    async remove(id: number): Promise<User> {
        const user = await this.findOne(id)
        return this.usersRepository.remove(user)
            .catch((err) => {
                throw new HttpException({
                    error: err.message
                }, HttpStatus.BAD_REQUEST)
            })
    }
}
