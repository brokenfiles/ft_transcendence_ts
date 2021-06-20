import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import {Logger, UseFilters, UseGuards} from "@nestjs/common";
import {Server, Socket} from 'socket.io'
import {WebsocketService} from "./websocket.service";
import {WsJwtAuthGuard} from "../../auth/ws-jwt-auth.guard";
import {UnauthorizedExceptionFilter} from "./exceptions/UnauthorizedExceptionFilter";
import {ChatsService} from "../../chat/chats.service";
import {CreateChannelDto} from "../../chat/dto/create-channel.dto";
import {SendMessageDto} from "../../chat/dto/send-message.dto";
import {PrivacyEnum} from "../../chat/enums/privacy.enum";
import {ChangeChannelInterface} from "./interfaces/change-channel.interface";
import {ChangeChannelPropertyInterface} from "./interfaces/change-channel-property.interface";
import {BanUsersFromChannelInterface} from "./interfaces/ban-users-from-channel.interface";
import {GameService} from "../../game/game.service";
import {QueueService} from "../../game/queue.service";
import {JwtService} from "@nestjs/jwt";
import {ClientJoinMatchInterface} from "./interfaces/client-join-match.interface";
import {Coordinates} from "../../game/classes/game.classes";


@WebSocketGateway(81,
    {
        cors: {
            origin: "http://localhost:3000",
            credentials: true
        }
    })
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    constructor(private jwtService: JwtService,
                private websocketService: WebsocketService,
                private chatsService: ChatsService,
                private gameService: GameService,
                private queueService: QueueService) {
    }

    @WebSocketServer() server: Server

    private logger: Logger = new Logger('ChatGateway')


    afterInit(server: Server) {
        this.logger.log('Gateway server initiated');
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client ${client.id} connected`);
        if ("query" in (client.handshake as any)) {
            const { token } = (client.handshake as any).query
            if (token) {
                try {
                    const content = this.jwtService.verify(token)
                    this.websocketService.addClient(client, content.sub, this.server)
                    this.logger.log(`Client ${content.sub} is now online!`)
                } catch (e: any) {
                    this.logger.log(`Error when decoding token : ${e}`)
                }
            }

        }
        this.websocketService.sendOnlineClientsToClient(client)
    }

    async handleDisconnect(client: Socket) {
        let sub
        this.logger.log(`Client ${client.id} disconnected`);
        await this.queueService.removeFromQueue(client)
        this.gameService.clientLeft(client)
        if ((sub = this.websocketService.removeClient(client.id, this.server)) !== -1) {
            this.logger.log(`User with id ${sub} is now offline`)
        }
    }

    /************************ CHAT EVENTS PART ************************/

    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('msgToServer')
    async msgToServerEvent(client: Socket, payload: SendMessageDto): Promise<void> {
        const message = await this.chatsService.pushMsgInChannel(payload)
        const channel = await this.chatsService.findOneChannel(payload.channel_id)
        const {sub} = (client.handshake as any).user

        let user_validate = channel.users.filter((user) => user.id === sub)

        if (channel && message) {
            let users_id = []
            if (channel.privacy === PrivacyEnum.PUBLIC || channel.privacy === PrivacyEnum.PASSWORD)
                users_id = this.websocketService.clients.filter((u) => u.channelId === channel.id).map((u) => u.userId)
            else if (user_validate.length > 0)
                users_id = channel.users.map((u) => u.id)

            const users_in_channel = this.websocketService.clients.filter((u) => users_id.includes(u.userId))
            for (const user of users_in_channel) {
                user.socket.emit('SendLastMessagesToClient', message)
            }
        }
    }

    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('createChannel')
    createChannelEvent(client: Socket, payload: CreateChannelDto): void {
        const {sub} = (client.handshake as any).user
        this.chatsService.createChannel(payload, sub).then((res) => {

            if (res.privacy === PrivacyEnum.PUBLIC || res.privacy === PrivacyEnum.PASSWORD) {
                for (let u of this.websocketService.onlineClients)
                {
                    const i = this.websocketService.onlineClients.indexOf(u)
                    if (i !== -1) {
                        this.chatsService.findAllChannel(u).then((channels) => {
                            this.websocketService.clients[i].socket.emit('getChannels', channels)
                        })
                    }
                }
            } else {
                let users_id = res.users.map((u) => u.id)
                for (const user of users_id) {
                    const index = this.websocketService.onlineClients.indexOf(user)
                    if (index !== -1) {
                        this.chatsService.findAllChannel(user).then((channels) => {
                            this.websocketService.clients[index].socket.emit('getChannels', channels)
                        })
                    }
                }
            }
        })
    }

    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('getChannels')
    getChannelsEvent(client: Socket): void {
        const {sub} = (client.handshake as any).user
        this.chatsService.findAllChannel(sub).then((res) => {
            client.emit('getChannels', res)
        })
    }

    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('channelChanged')
    async changeChannel(client: Socket, payload: ChangeChannelInterface): Promise<any> {
        const {sub} = (client.handshake as any).user
        let messages = []
        this.websocketService.changeCurrentChannel(client, payload)
        const channel = await this.chatsService.findOneChannel(payload.channel_id)
        if (channel) {

            if (this.chatsService.isUserBannedFromChannel(sub, channel))
                return { error: "You're banned from this channel" }
            if ((channel.privacy === PrivacyEnum.PUBLIC) ||
                (channel.privacy === PrivacyEnum.PRIVATE && await this.chatsService.isUserInChannel(sub, channel)) ||
                (channel.privacy === PrivacyEnum.PASSWORD && payload.password === channel.password)) {
                messages = await this.chatsService.getMessageFromChannel(payload.channel_id)
            } else {
                return {
                    error: "Invalid password"
                }
            }
        }
        return { messages: messages }
        // client.emit('SendMessagesToClient', messages)
    }


    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('toggleBanUserFromChannel')
    async banUserFromChannel(client: Socket, payload: BanUsersFromChannelInterface) {
        const {sub} = (client.handshake as any).user
        const banned_state = await this.chatsService.banUserFromChannel(sub, payload)
        return {banned: banned_state}
    }


    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('changeChannelProperty')
    async changeChannelProperty(client: Socket, payload: ChangeChannelPropertyInterface): Promise<void> {
        const {sub} = (client.handshake as any).user
        await this.chatsService.changeChannelProperties(client, sub, payload)
    }


    /************************ GAME EVENTS PART ************************/

    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('clientJoinedQueue')
    async joinQueue(client: Socket) {
        await this.queueService.addPlayerToQueue(client)
    }

    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('clientLeftQueue')
    async leaveQueue(client: Socket) {
        await this.queueService.removeFromQueue(client)
    }

    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('getMatch')
    async ClientJoinGame(client: Socket, payload: ClientJoinMatchInterface) {
        return this.gameService.getGameBySocketAndUUID(client, payload);
    }

    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('clientReadyToPlay')
    async clientReadyToPlay(client: Socket) {
        const {sub} = (client.handshake as any).user
        await this.gameService.clientReadyToPlay(sub)
    }

    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('clientLeftGame')
    async clientLeft(client: Socket) {
        this.gameService.clientLeft(client)
    }

    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('clientUpdatedPadPosition')
    async clientUpdatedPadPosition(client: Socket, coordinates: Coordinates) {
        const {sub} = (client.handshake as any).user
        await this.gameService.updatePadCoordinates(sub, coordinates)
    }


}


