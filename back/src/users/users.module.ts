import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {Guild} from "../guilds/entities/guild.entity";
import {WebsocketModule} from "../gateways/websocket/websocket.module";
import {AchievementsModule} from "../achievement/achievements.module";

@Module({
    imports: [
        WebsocketModule,
        AchievementsModule,
        TypeOrmModule.forFeature([User, Guild]),
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {
}
