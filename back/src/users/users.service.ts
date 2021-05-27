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

    async findOne(id: number, relations: string[] = []): Promise<User> {
        const friends = await this.usersRepository.query(
            `SELECT *
              FROM Users U
              WHERE U.id <> $1
                AND EXISTS(
                      SELECT 1
                      FROM users_friends_users F
                      WHERE (F."usersId_1" = $1 AND F."usersId_2" = U.id)
                         OR (F."usersId_2" = $1 AND F."usersId_1" = U.id)
                  );`,
            [id],
        );
        let user = await this.usersRepository.findOneOrFail(id, {
            relations: [
                'guild', 'achievements', ...relations
            ]
        }).catch((err) => {
            throw new HttpException({
                error: err.message
            }, HttpStatus.BAD_REQUEST)
        })
        user.friends = friends
        return Promise.resolve(user)
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

    /**
     * Add the friend to user entity
     * @param requester
     * @param requested
     */
    async addFriend(requester: User, requested: User): Promise<User | undefined> {
        const alreadyFriends = requester.friends.map(friend => friend.id).indexOf(requested.id) !== -1
        if (!alreadyFriends)
            requester.friends.push(requested)
        return !alreadyFriends ? this.usersRepository.save(requester) : undefined
    }

    /**
     * Remove a friend
     * @param {User} user the authenticated user
     * @param {User} friend
     */
    async removeFriend(user: User, friend: User) {
        const index = user.friends.map(fd => fd.id).indexOf(friend.id)
        if (index === -1)
            throw new HttpException({
                error: 'You are not friend with this user'
            }, HttpStatus.BAD_REQUEST)
        user.friends.splice(index, 1)
        return this.usersRepository.save(user)
    }

}
