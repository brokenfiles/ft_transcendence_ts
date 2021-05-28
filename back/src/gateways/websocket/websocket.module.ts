import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Channel} from "./entities/channel.entity";
import {Message} from "./entities/message.entity";
import {WebsocketService} from "./websocket.service";
import {WebsocketGateway} from "./websocket.gateway";

@Module({
    imports: [
        TypeOrmModule.forFeature([Channel, Message])
    ],
    providers: [WebsocketService, WebsocketGateway],
    exports: [WebsocketService]
})
export class WebsocketModule {}
