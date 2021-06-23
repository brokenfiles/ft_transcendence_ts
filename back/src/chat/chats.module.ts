import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ChatsController} from "./chats.controller";
import {ChatsService} from "./chats.service";
import {Message} from "./entities/message.entity";
import {Channel} from "./entities/channel.entity";
import {UsersModule} from "../users/users.module";
import {WebsocketModule} from "../gateways/websocket/websocket.module";
import {User} from "../users/entities/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Message, Channel, User]),
        forwardRef(() => UsersModule),
        forwardRef(() => WebsocketModule)
    ],
    controllers: [ChatsController],
    providers: [ChatsService],
    exports: [ChatsService]
})
export class ChatsModule {
}