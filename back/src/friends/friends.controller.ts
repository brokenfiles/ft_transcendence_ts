import {Body, Controller, Delete, Get, Post, Req, UseGuards} from "@nestjs/common";
import {FriendRequestDto} from "./dto/friend-request.dto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {FriendsService} from "./friends.service";
import {FriendRequest} from "./entities/friend-request.entity";
import {User} from "../users/entities/user.entity";
import {AcceptRequestDto} from "./dto/accept-request.dto";
import {RemoveFriendDto} from "./dto/remove-friend.dto";

@Controller("friends")
export class FriendsController {

    constructor(private friendsService: FriendsService) {}

    @Post("requests")
    @UseGuards(JwtAuthGuard)
    requestFriend(@Req() request, @Body() friendRequest: FriendRequestDto) : Promise<FriendRequest> {
        return this.friendsService.requestFriend(request.user.sub, friendRequest.requested)
    }

    /**
     * Controller to find the authenticated user requests
     * @param request
     */
    @Get("requests")
    @UseGuards(JwtAuthGuard)
    findAllRequests(@Req() request): Promise<FriendRequest[]> {
        return this.friendsService.findAllRequests(request.user.sub)
    }

    @Post("accept")
    @UseGuards(JwtAuthGuard)
    acceptRequest(@Req() request, @Body() acceptRequest: AcceptRequestDto): Promise<User> {
        return this.friendsService.acceptRequest(request.user.sub, acceptRequest.requester)
    }

    @Delete()
    @UseGuards(JwtAuthGuard)
    removeFriend(@Req() request, @Body() removeFriend: RemoveFriendDto): Promise<User> {
        return this.friendsService.removeFriend(request.user.sub, removeFriend.friend)
    }

}
