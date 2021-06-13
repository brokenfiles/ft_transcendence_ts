import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {Message} from "./entities/message.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Channel} from "./entities/channel.entity";
import {CreateChannelDto} from "./dto/create-channel.dto";
import {UsersService} from "../users/users.service";
import {SendMessageDto} from "./dto/send-message.dto";
import {PrivacyEnum} from "./enums/privacy.enum";
import {WsException} from "@nestjs/websockets";
import {WebsocketService} from "../gateways/websocket/websocket.service";

@Injectable()
export class ChatsService {

    constructor(@InjectRepository(Channel) private channelRepository: Repository<Channel>,
                @InjectRepository(Message) private messageRepository: Repository<Message>,
                private readonly usersService : UsersService,
                private readonly websocketService : WebsocketService) {}

    findAllMessages() : Promise<Message[]> {
        return this.messageRepository.find({}).catch((err) => {
            throw new HttpException({
                error: err.message
            }, HttpStatus.BAD_REQUEST)
        })
    }

    async findAllChannel(user_id: number): Promise<Channel[]> {

        let user = await this.usersService.findOne(user_id, ['channels'])

        let publicChannels = await this.channelRepository.find({
            where: {
                privacy: PrivacyEnum.PUBLIC,
            }
        })
        const channels_id = user.channels.map((c) => c.id)
        for (const channel of publicChannels)
        {
            if (!channels_id.includes(channel.id))
                user.channels.push(channel)
        }
        for (let channel of user.channels)
            delete channel.password
        return user.channels
    }

    findChannelWhereUserId(client_id: number) : any {
        console.log(client_id)
    }

    async createChannel(ChannelDto: CreateChannelDto, sub: number) {

        try {
            let newChannel = await this.channelRepository.create({
                name: ChannelDto.name,
                privacy: ChannelDto.privacy
            })

            if (ChannelDto.privacy === PrivacyEnum.PASSWORD)
                newChannel.password = ChannelDto.password

            newChannel.users = []

            let user = await this.usersService.findOne(sub)
            newChannel.owner = user
            newChannel.users.push(user)


            if (ChannelDto.users.length > 0)
            {
                for (const user of ChannelDto.users)
                {
                    let tmp = await this.usersService.findOne(user)
                    newChannel.users.push(tmp)
                }
            }
            return this.channelRepository.save(newChannel)
        }
        catch (e)
        {
            throw new WsException({
                error: 'Cant create Channel'
            })
        }
    }

    async getMessageFromChannel(id: number): Promise<Message[]>{
        try {
            const channel = await this.channelRepository.findOne(id)
            if (channel)
            {
                return this.messageRepository.find({
                        relations: ['owner'],
                        where: {
                            channel
                        },
                        order: {
                            created_at: "ASC"
                        }
                    })
            }
        }
        catch (e) {
            throw new WsException({
                error: `Can't get message from channel`
            })
        }
    }

    async pushMsgInChannel(sendMessageDto: SendMessageDto) {
        try {
            let newMessage = await this.messageRepository.create({
                    text: sendMessageDto.message
                }
            )

            let channel = await this.channelRepository.find({
                relations: ['messages'],
                where: {
                    id: sendMessageDto.channel_id
                }
            })

            let owner = await this.usersService.findOne(sendMessageDto.user_id, ["messages", "channels"])
            newMessage.channel = channel[0]
            newMessage.owner = owner
            return this.messageRepository.save(newMessage)

        } catch (e) {
            throw new HttpException({
                error: 'Cant push message in channel'
            }, HttpStatus.BAD_REQUEST)
        }

    }

    async findOneChannel(id: number) {
        return this.channelRepository.findOne({
            relations: ['users'],
            where: {
                id
            }
        })
    }
}