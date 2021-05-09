import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {UsersController} from './users.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {Guild} from "../guilds/entities/guild.entity";
import {GuildsService} from "../guilds/guilds.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Guild]),
    ],
    controllers: [UsersController],
    providers: [UsersService, GuildsService],
    exports: [UsersService]
})
export class UsersModule {
}
