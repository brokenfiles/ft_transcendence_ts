import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {Message} from "./entities/message.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Channel} from "./entities/channel.entity";
import {CreateChannelDto} from "./dto/create-channel.dto";
import {UsersService} from "../users/users.service";
import {SendMessageDto} from "./dto/send-message.dto";

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

    async findAllChannel(user_id: number): Promise<{ owner_id: number; name: string; id: number }[]> {

        let user = await this.usersService.findOne(user_id, ['channels'])

        return user.channels.map((channel) => {
            return {
                id: channel.id,
                name: channel.name,
                owner_id: user.id
            }
        })

        // return this.channelRepository.find({
        //     relations: [
        //         'messages', 'users'
        //     ],
        // }).catch((err) => {
        //     throw new HttpException({
        //         error: err.message
        //     }, HttpStatus.BAD_REQUEST)
        // })
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

    async getMessageFromChannel(channel_name: string): Promise<string[]>{

        let channel = await this.channelRepository.findOne({
            relations: ['messages'],
            where: {
                name: channel_name
            }
        })

        if (channel)
        {
            console.log(channel)
            let messages = channel.messages.map((e) => {
                return e.text
            })
            console.log(messages)
            return messages
        }
        return null

    }


    async pushMsgInChannel(sendMessageDto: SendMessageDto) {
        console.log("sendMessageDto:", sendMessageDto)

        try {
            let newMessage = await this.messageRepository.create({
                    text: sendMessageDto.message
                }
            )

            let channel = await this.channelRepository.find({
                relations: ['messages'],
                where: {
                    name: sendMessageDto.channel
                }
            })


            let owner = await this.usersService.findOne(sendMessageDto.user_id, ["messages", "channels"])

            newMessage.channel = channel[0]
            newMessage.owner = owner
            await this.messageRepository.save(newMessage)

        } catch (e) {
            throw new HttpException({
                error: 'Cant push message in channel'
            }, HttpStatus.BAD_REQUEST)
        }

    }
}