import {Module} from "@nestjs/common";
import {FriendsController} from "./friends.controller";
import {FriendsService} from "./friends.service";
import {UsersModule} from "../users/users.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {FriendRequest} from "./entities/friend-request.entity";
import {WebsocketModule} from "../gateways/websocket/websocket.module";

@Module({
    imports: [
        UsersModule,
        WebsocketModule,
        TypeOrmModule.forFeature([FriendRequest])
    ],
    controllers: [FriendsController],
    providers: [FriendsService]
})
export class FriendsModule {}
