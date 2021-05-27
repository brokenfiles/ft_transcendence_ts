import {UsersService} from "../users/users.service";
import {HttpCode, HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FriendRequest} from "./entities/friend-request.entity";
import {Repository} from "typeorm";
import {User} from "../users/entities/user.entity";

@Injectable()
export class FriendsService {

    constructor(private usersService: UsersService,
                @InjectRepository(FriendRequest) private friendRequestRepository: Repository<FriendRequest>) {}

    /**
     * Send the request to the requested user if request does not exist
     * @param {number} requesterId
     * @param {User} requested
     */
    async requestFriend(requesterId: number, requested: User) {
        const requester = await this.usersService.findOne(requesterId)
        if (requester && !await this.hasRequest(requester, requested)) {
            const friendRequest = this.friendRequestRepository.create({
                requester, requested
            })
            return this.friendRequestRepository.save(friendRequest)
        } else {
            throw new HttpException({
                error: "You have already sent a friend request to this user"
            }, HttpStatus.BAD_REQUEST)
        }
    }

    /**
     * Return the request if it exists, undefined otherwise
     * @param {User} requester
     * @param {User} requested
     */
    async hasRequest(requester: User, requested: User): Promise<FriendRequest | undefined> {
        return (this.friendRequestRepository.findOne({
            where: {
                requester, requested
            }
        }))
    }

    /**
     * Find sub's friends requests
     * @param {Number} sub
     */
    async findAllRequests(sub: number): Promise<FriendRequest[]> {
        const requester = await this.usersService.findOne(sub)
        if (!requester)
            throw new HttpException({
                error: `The user does not exist`
            }, HttpStatus.BAD_REQUEST)
        return this.friendRequestRepository.find({
            relations: [
                'requester', 'requested'
            ],
            where: [
                { requester: requester },
                { requested: requester }
            ]
        })
    }

    /**
     * Accept a request
     * @param sub
     * @param requester
     */
    acceptRequest(sub: number, requester: User): Promise<User> {
        return Promise.resolve(undefined);
    }
}
