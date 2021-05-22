import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Channel} from "./entities/channel.entity";
import {Message} from "./entities/message.entity";
import {ChatService} from "./chat.service";
import {ChatGateway} from "./chat.gateway";

@Module({
    imports: [
        TypeOrmModule.forFeature([Channel, Message])
    ],
    providers: [ChatService, ChatGateway],
})
export class ChatModule {}
