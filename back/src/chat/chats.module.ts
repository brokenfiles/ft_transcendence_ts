import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ChatsController} from "./chats.controller";
import {ChatsService} from "./chats.service";
import {Message} from "./entities/message.entity";
import {Channel} from "./entities/channel.entity";
import {UsersModule} from "../users/users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Message, Channel]),
        UsersModule
    ],
    controllers: [ChatsController],
    providers: [ChatsService],
    exports: [ChatsService]
})
export class ChatsModule {
}