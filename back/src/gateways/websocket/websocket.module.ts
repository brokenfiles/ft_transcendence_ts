import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {WebsocketService} from "./websocket.service";
import {WebsocketGateway} from "./websocket.gateway";
import {Channel} from "../../chat/entities/channel.entity";
import {Message} from "../../chat/entities/message.entity";
import {ChatsService} from "../../chat/chats.service";
import {UsersService} from "../../users/users.service";
import {User} from "../../users/entities/user.entity";
import {GameService} from "../../game/game.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Channel, Message, User]),
    ],
    providers: [WebsocketService, WebsocketGateway, ChatsService, UsersService, GameService],
    exports: [WebsocketService]
})
export class WebsocketModule {}
