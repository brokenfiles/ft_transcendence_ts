import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {Message} from "./entities/message.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Channel} from "./entities/channel.entity";
import {CreateChannelDto} from "./dto/create-channel.dto";
import {UsersService} from "../users/users.service";

@Injectable()
export class ChatsService {

    constructor(@InjectRepository(Channel) private channelRepository: Repository<Channel>,
                @InjectRepository(Message) private messageRepository: Repository<Message>,
                private readonly usersService : UsersService) {}

    findAllMessages() : Promise<Message[]> {
        return this.messageRepository.find({}).catch((err) => {
            throw new HttpException({
                error: err.message
            }, HttpStatus.BAD_REQUEST)
        })
    }

    findAllChannel() : Promise<Channel[]> {
        return this.channelRepository.find({
            relations: [
                'messages', 'users'
            ]
        }).catch((err) => {
            throw new HttpException({
                error: err.message
            }, HttpStatus.BAD_REQUEST)
        })
    }

    findChannelWhereUserId(client_id: number) : any {
        console.log(client_id)
    }

    async createChannel(ChannelDto: CreateChannelDto) {

        try {
            let newChannel = await this.channelRepository.create({
                name: ChannelDto.name
            })

            newChannel.users = []

            let user = await this.usersService.findOne(ChannelDto.user_id)
            newChannel.users.push(user)
            await this.channelRepository.save(newChannel)
        }
        catch (e)
        {
            throw new HttpException({
                error: 'Cant create Channel'
            }, HttpStatus.BAD_REQUEST)
        }
    }
}