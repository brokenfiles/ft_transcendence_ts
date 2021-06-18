import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersModule} from "../users/users.module";
import {WebsocketModule} from "../gateways/websocket/websocket.module";
import {GameController} from "./game.controller";
import {GameService} from "./game.service";
import {Game} from "./entity/game.entity";
import {QueueService} from "./queue.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Game]),
        forwardRef(() => UsersModule),
        forwardRef(() => WebsocketModule)
    ],
    controllers: [GameController],
    providers: [GameService, QueueService],
    exports: [GameService, QueueService]

})
export class GameModule {
}