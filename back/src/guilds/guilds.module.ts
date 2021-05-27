import {Module} from "@nestjs/common";
import {GuildsController} from './guilds.controller';
import {GuildsService} from "./guilds.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Guild} from "./entities/guild.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Guild])
    ],
    controllers: [GuildsController],
    providers: [GuildsService],
    exports: [GuildsService]
})
export class GuildsModule {
}
