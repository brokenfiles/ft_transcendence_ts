import {Module} from "@nestjs/common";
import {FriendsController} from "./friends.controller";
import {FriendsService} from "./friends.service";
import {UsersModule} from "../users/users.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {FriendRequest} from "./entities/friend-request.entity";

@Module({
    imports: [
        UsersModule,
        TypeOrmModule.forFeature([FriendRequest])
    ],
    controllers: [FriendsController],
    providers: [FriendsService]
})
export class FriendsModule {}
