import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {Guild} from "../guilds/entities/guild.entity";
import {WebsocketModule} from "../gateways/websocket/websocket.module";

@Module({
    imports: [
        WebsocketModule,
        TypeOrmModule.forFeature([User, Guild]),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {
}
