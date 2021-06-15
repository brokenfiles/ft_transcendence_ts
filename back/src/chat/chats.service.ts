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
import {ChangeChannelPropertyInterface} from "../gateways/websocket/interfaces/change-channel-property.interface";
import {User} from "../users/entities/user.entity";
import {Socket} from "socket.io";
import {BanUsersFromChannelInterface} from "../gateways/websocket/interfaces/ban-users-from-channel.interface";

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

        let user = await this.usersService.findOne(user_id,
            ['channels', 'channels.banned_users', 'channels.administrators', 'channels.users', 'channels.owner'])

        let publicChannels = await this.channelRepository.find({
            relations: ['banned_users', 'administrators', 'users', 'owner'],
            where: [
                {privacy: PrivacyEnum.PUBLIC},
                {privacy: PrivacyEnum.PASSWORD}
            ],
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

    async isUserInChannel(user_id: number, channel: Channel) : Promise<boolean>
    {
        return channel.users.map(u => u.id).includes(user_id);
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
            newChannel.banned_users = []
            newChannel.administrators = []

            let user = await this.usersService.findOne(sub)
            newChannel.owner = user
            newChannel.users.push(user)
            newChannel.administrators.push(user)


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
            throw new WsException({
                error: `Can't push message in channel`
            })
        }

    }

    async findOneChannel(id: number) {
        return this.channelRepository.findOne({
            relations: ['users', 'administrators', 'banned_users', 'owner'],
            where: {
                id
            }
        })
    }

    async emitAllChannelForUserConcernedByChannelChanged(channel: Channel) : Promise<void>
    {
        //optimisation: envoyez seulement au user qui ont été enlever/ajouté/mis admin/etc
        for (const user_id of this.websocketService.onlineClients)
        {
            const i = this.websocketService.onlineClients.indexOf(user_id)
            if (i !== -1) {
                this.findAllChannel(user_id).then((channels) => {
                    this.websocketService.clients[i].socket.emit('getChannels', channels)
                })
            }
        }
    }

    isUserAdministrator(user: User, channel: Channel): boolean {
        return user.channels_admin.map((channel) => channel.id).includes(channel.id)
    }

    isUserBannedFromChannel(user_id: number, channel: Channel)
    {
        return channel.banned_users.map((u) => u.id).includes(user_id);
    }

    emitClientToHome(user_id: User, channel: Channel, message: string) {
        const i = this.websocketService.onlineClients.indexOf(user_id.id)
        if (i !== -1 && this.websocketService.clients[i].channelId === channel.id) {
            this.websocketService.clients[i].socket.emit("goBackToHome", {
                message,
                type: "error"
            })
        }
    }

    async setUsersChannelAdministrator(sub: number, user: User, promoted_user_id: number[], channel: Channel) {
        try {

            const users = await this.usersService.findUsersByIds(promoted_user_id)
            if (!users && !channel)
                throw new WsException(`invalid users or channel`)
            channel.administrators = [user]
            if (this.isUserAdministrator(user, channel)) {
                for (const u of users) {

                    channel.administrators.push(u)
                    await this.channelRepository.save(channel)
                }
            }
        }
        catch (e)
        {
            throw new WsException({
                error: `Can't set user administrator`
            })
        }
    }

    async banUserFromChannel(sub: number, payload: BanUsersFromChannelInterface): Promise<Boolean>{
        let curr_channel = await this.findOneChannel(payload.channel_id)
        const current_admin_user = await this.usersService.findOne(sub)
        let state
        if (curr_channel && this.isUserAdministrator(current_admin_user, curr_channel)) {

            if (curr_channel.banned_users.map((u) => u.id).includes(payload.toggle_ban_user_id)) {
                curr_channel.banned_users = curr_channel.banned_users.filter((u) => u.id != payload.toggle_ban_user_id)
                state = false
            } else {
                const user_to_ban = await this.usersService.findOne(payload.toggle_ban_user_id)

                if (user_to_ban) {
                    curr_channel.banned_users.push(user_to_ban)
                    await this.emitClientToHome(user_to_ban, curr_channel, "You've been banned from this channel")
                    state = true
                }
            }
            await this.channelRepository.save(curr_channel)
            await this.emitAllChannelForUserConcernedByChannelChanged(curr_channel)
            return state
        }
        // return false
    }

    async changeChannelProperties(client: Socket, sub: number, payload: ChangeChannelPropertyInterface) {

        let curr_channel = await this.findOneChannel(payload.channel_id)
        const user = await this.usersService.findOne(sub)
        if (curr_channel && user && this.isUserAdministrator(user, curr_channel)) {

            const current_privacy = curr_channel.privacy

            if (curr_channel.privacy !== payload.privacy)
                curr_channel.privacy = payload.privacy

            if (curr_channel.privacy === PrivacyEnum.PUBLIC && current_privacy != curr_channel.privacy)
                curr_channel.users = [user]

            if (curr_channel.privacy === PrivacyEnum.PASSWORD && payload.privacy === PrivacyEnum.PASSWORD)
                curr_channel.password = payload.password

            //si il faut ajouté des users dans le channel privé
            if (curr_channel.privacy === PrivacyEnum.PRIVATE && current_privacy === PrivacyEnum.PRIVATE)
                curr_channel.users = [user]

            if (payload._private_users.length) {
                    const users_to_add = await this.usersService.findUsersByIds(payload._private_users)
                    for (let u of users_to_add)
                        curr_channel.users.push(u)
                }
            }
            if (payload.promoted_users_id) {
                await this.setUsersChannelAdministrator(sub, user, payload.promoted_users_id, curr_channel)
            }

            curr_channel =  await this.channelRepository.save(curr_channel)

            this.findAllChannel(sub).then((res) => {
                client.emit('getChannels', res)
            })

            await this.emitAllChannelForUserConcernedByChannelChanged(curr_channel)

        }
}
