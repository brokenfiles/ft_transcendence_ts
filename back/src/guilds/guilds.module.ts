import {Module} from "@nestjs/common";
import {GuildsController} from './guilds.controller';
import {GuildsService} from "./guilds.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Guild} from "./entities/guild.entity";
import {UsersModule} from "../users/users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Guild]),
        UsersModule,
    ],
    controllers: [GuildsController],
    providers: [GuildsService],
    exports: [GuildsService]
})
export class GuildsModule {
}
