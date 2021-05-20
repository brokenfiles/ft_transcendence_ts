import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Channel} from "./entities/channel.entity";
import {Repository} from "typeorm";
import {Message} from "./entities/message.entity";

@Injectable()
export class ChatService {
    constructor(@InjectRepository(Channel) private channelRepository: Repository<Channel>,
                @InjectRepository(Message) private messageRepository: Repository<Message>)
    {}

    // async createChannel(channelOptions: any): Promise<Channel> {
    //     const channel = this.channelRepository.create(channelOptions)
        // return (this.channelRepository.save(channel))
    // }
}
