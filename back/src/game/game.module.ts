import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersModule} from "../users/users.module";
import {WebsocketModule} from "../gateways/websocket/websocket.module";
import {GameController} from "./game.controller";
import {GameService} from "./game.service";
import {Game} from "./entity/game.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Game]),
        UsersModule,
        WebsocketModule
    ],
    controllers: [GameController],
    providers: [GameService],
    exports: [GameService]

})
export class GameModule {
}