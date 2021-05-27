import {Module} from "@nestjs/common";
import {FriendsController} from "./friends.controller";
import {FriendsService} from "./friends.service";
import {UsersModule} from "../users/users.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {FriendRequest} from "./entities/friend-request.entity";
import {ChatModule} from "../gateways/chat/chat.module";

@Module({
    imports: [
        UsersModule,
        ChatModule,
        TypeOrmModule.forFeature([FriendRequest])
    ],
    controllers: [FriendsController],
    providers: [FriendsService]
})
export class FriendsModule {}
