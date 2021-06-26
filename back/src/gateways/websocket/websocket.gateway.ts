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
import {CreateChannelDto, CreateDirectChannelDto} from "../../chat/dto/create-channel.dto";
import {SendMessageDto} from "../../chat/dto/send-message.dto";
import {BLOCKED_MSG, PrivacyEnum} from "../../chat/enums/privacy.enum";
import {ChangeChannelInterface} from "./interfaces/change-channel.interface";
import {ChangeChannelPropertyInterface} from "./interfaces/change-channel-property.interface";
import {
    BanUsersFromChannelInterface,
    MuteUsersFromChannelInterface
} from "./interfaces/ban-users-from-channel.interface";
import {GameService} from "../../game/game.service";
import {QueueService} from "../../game/queue.service";
import {JwtService} from "@nestjs/jwt";
import {ClientJoinMatchInterface} from "./interfaces/client-join-match.interface";
import {Coordinates} from "../../game/classes/game.classes";
import {UsersService} from "../../users/users.service";
import {RemoveChannelInterface} from "./interfaces/remove-channel.interface";
import {LeaveChannelInterface} from "./interfaces/leave-channel.interface";
import {ChallengeUserInterface} from "./interfaces/challenge-user.interface";


@WebSocketGateway(81,
    {
        cors: {
            origin: process.env.FRONT_URI,
            credentials: true
        }
    })
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    constructor(private jwtService: JwtService,
                private websocketService: WebsocketService,
                private chatsService: ChatsService,
                private gameService: GameService,
                private queueService: QueueService,
                private userService: UsersService) {
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
    async msgToServerEvent(client: Socket, payload: SendMessageDto): Promise<any> {
        const {sub} = (client.handshake as any).user
        await this.chatsService.messageToServer(sub, payload)
    }


    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('createDirectChannel')
    async createDirectChannel(client: Socket, payload: CreateDirectChannelDto): Promise<any> {
        const {sub} = (client.handshake as any).user
        payload.name = `mp: ${payload.requester} ${payload.receiver}`
        if (!await this.chatsService.findChannelByName(payload.name)) {
            this.chatsService.createChannelTemplate(payload, sub)
            return ({
                success: `direct channel ${payload.name} created`
            })
        }
        return ({
            error: `direct channel ${payload.name} already exists`
        })
    }

    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('createChannel')
    createChannelEvent(client: Socket, payload: CreateChannelDto): any {
        const {sub} = (client.handshake as any).user
        if (payload.name.search("mp:") !== -1)
            return ({
                error: "You cannot create channel with \'mp:\' ban word",
            })

        this.chatsService.createChannelTemplate(payload, sub)
        return ({
            success: `Channel ${payload.name} created !`,
        })
    }

    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('removeChannel')
    async removeChannelEvent(client: Socket, payload: RemoveChannelInterface): Promise<any> {
        const {sub} = (client.handshake as any).user
        return await this.chatsService.removeChannel(payload, sub)
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
    @SubscribeMessage('getLazyMessages')
    async getLazyMessagesEvent (client: Socket, payload: ChangeChannelInterface): Promise<any> {
        const {sub} = (client.handshake as any).user
        let messages = []
        this.websocketService.changeCurrentChannel(client, payload)
        const channel = await this.chatsService.findOneChannel(payload.channel_id)
        if (channel) {
            if (this.chatsService.isUserBannedFromChannel(sub, channel))
                return {error: "You're banned from this channel"}
            if ((channel.privacy === PrivacyEnum.PUBLIC) ||
                (channel.privacy === PrivacyEnum.PRIVATE && await this.chatsService.isUserInChannel(sub, channel) ||
                    (channel.privacy === PrivacyEnum.PASSWORD && payload.password === channel.password))) {
                messages = await this.chatsService.getMessageFromChannel(sub, payload.channel_id, payload.page)
            } else {
                return {
                    error: "Invalid password"
                }
            }
        }
        return { messages: messages }
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
                return {error: "You're banned from this channel"}
            if ((channel.privacy === PrivacyEnum.PUBLIC) ||
                (channel.privacy === PrivacyEnum.PRIVATE && await this.chatsService.isUserInChannel(sub, channel) ||
                (channel.privacy === PrivacyEnum.PASSWORD && payload.password === channel.password))) {
                messages = await this.chatsService.getMessageFromChannel(sub, payload.channel_id, payload.page)
            } else {
                return {
                    error: "Invalid password"
                }
            }
        }
        return { messages: messages }
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
    @SubscribeMessage('toggleMuteUserFromChannel')
    async muteUserFromChannel(client: Socket, payload: MuteUsersFromChannelInterface)
    {
        const {sub} = (client.handshake as any).user
        const mute_state = await this.chatsService.muteUserFromChannel(sub, payload)
        console.log(mute_state)
        return {
            muted: mute_state
        }
    }

    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('changeChannelProperty')
    async changeChannelProperty(client: Socket, payload: ChangeChannelPropertyInterface): Promise<void> {
        const {sub} = (client.handshake as any).user
        await this.chatsService.changeChannelProperties(client, sub, payload)
    }

    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('leaveChannel')
    async leaveChannelEvent(client: Socket, payload: LeaveChannelInterface): Promise<any> {
        const {sub} = (client.handshake as any).user
        return await this.chatsService.leaveChannel(sub, payload)
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
    @SubscribeMessage('clientJoinedSpectator')
    async clientJoinedSpectator(client: Socket, uuid: string) {
        const {sub} = (client.handshake as any).user
        await this.gameService.clientJoinedSpectator(sub, uuid)
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

    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('challengeUser')
    async challengeUserEvent(client: Socket, payload: ChallengeUserInterface) {
        const {sub} = (client.handshake as any).user
        console.log(sub, payload.user_id)
        const challengePayload = await this.gameService.challengeUser(sub, payload)
        this.websocketService.getClient(payload.user_id).socket.emit("receiveGameNotify", challengePayload)
    }


    @UseGuards(WsJwtAuthGuard)
    @UseFilters(new UnauthorizedExceptionFilter())
    @SubscribeMessage('startPrivateChallenge')
    async startPrivateChallengeEvent(client: Socket, payload: ChallengeUserInterface) {
        const {sub} = (client.handshake as any).user
        console.log(sub, payload.user_id)

        await this.gameService.startChallenge(sub, payload)
    }



}


