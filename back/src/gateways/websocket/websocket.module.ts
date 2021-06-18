import {forwardRef, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {WebsocketService} from "./websocket.service";
import {WebsocketGateway} from "./websocket.gateway";
import {Channel} from "../../chat/entities/channel.entity";
import {Message} from "../../chat/entities/message.entity";
import {ChatsService} from "../../chat/chats.service";
import {UsersService} from "../../users/users.service";
import {User} from "../../users/entities/user.entity";
import {GameService} from "../../game/game.service";
import {QueueService} from "../../game/queue.service";
import {GameModule} from "../../game/game.module";
import {ChatsModule} from "../../chat/chats.module";
import {UsersModule} from "../../users/users.module";
import {JwtModule} from "@nestjs/jwt";
import {jwtConstants} from "../../auth/constants";

@Module({
    imports: [
        TypeOrmModule.forFeature([Channel, Message, User]),
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: {
                expiresIn: jwtConstants.expiresIn
            },
        }),
        forwardRef(() => GameModule),
        forwardRef(() => ChatsModule),
        forwardRef(() => UsersModule)
    ],
    providers: [WebsocketService, WebsocketGateway],
    exports: [WebsocketService]
})
export class WebsocketModule {}
