import {UsersService} from "../users/users.service";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {FriendRequest} from "./entities/friend-request.entity";
import {Repository} from "typeorm";
import {User} from "../users/entities/user.entity";
import {WebsocketService} from "../gateways/websocket/websocket.service";

@Injectable()
export class FriendsService {

    constructor(private usersService: UsersService,
                private chatService: WebsocketService,
                @InjectRepository(FriendRequest) private friendRequestRepository: Repository<FriendRequest>) {}

    /**
     * Send the request to the requested user if request does not exist
     * @param {number} requesterId
     * @param {User} requested
     */
    async requestFriend(requesterId: number, requested: User) {
        const requester = await this.usersService.findOne(requesterId)
        if (requester && !await this.hasRequest(requester, requested)) {
            if (requesterId === requested.id)
                throw new HttpException({
                    error: `You can't be friend with yourself`
                }, HttpStatus.BAD_REQUEST)
            const friendRequest = this.friendRequestRepository.create({
                requester, requested
            })
            this.chatService.notify([requested.id], {
                message: `${requester.display_name} wants to be your friend`,
                fetchClient: true
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
     * @param {number} sub the requested user id
     * @param requester
     */
    async acceptRequest(sub: number, requester: User): Promise<User> {
        let requested = await this.usersService.findOne(sub)
        if (!requested)
            throw new HttpException({
                error: "Requested user does not exist"
            }, HttpStatus.BAD_REQUEST)
        const friendRequest = await this.friendRequestRepository.findOne({ where: { requester, requested } })
        if (!friendRequest)
            throw new HttpException({
                error: "The request does not exist"
            }, HttpStatus.BAD_REQUEST)
        // add friend
        requested = await this.usersService.addFriend(requested, requester)
        if (!requested)
            throw new HttpException({
                error: 'You are already friends'
            }, HttpStatus.BAD_REQUEST)
        // notify user
        this.chatService.notify([requester.id], {
            message: `You are now friend with ${requested.display_name}`,
            fetchClient: true
        })
        // remove friend request
        await this.friendRequestRepository.remove(friendRequest)
        return requested;
    }

    /**
     * Remove a friend
     * @param {number} sub the authenticated user
     * @param {User} friend
     */
    async removeFriend(sub: number, friend: User) {
        return this.usersService.removeFriend(friend.id, sub)
    }

}
