import {
  OnGatewayConnection, OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import {Logger, UseFilters, UseGuards} from "@nestjs/common";
import {Server, Socket} from 'socket.io'
import {WebsocketService} from "./websocket.service";
import {ClientInterface} from "./interfaces/client.interface";
import {WsJwtAuthGuard} from "../../auth/ws-jwt-auth.guard";
import {UnauthorizedExceptionFilter} from "./exceptions/UnauthorizedExceptionFilter";
import {ChatsService} from "../../chat/chats.service";
import {CreateChannelDto} from "../../chat/dto/create-channel.dto";
import {Channel} from "../../chat/entities/channel.entity";
import {SendMessageDto} from "../../chat/dto/send-message.dto";

@WebSocketGateway(81,
    {
      cors: {
        origin: "http://localhost:3000",
        credentials: true
      }
    })
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private websocketService: WebsocketService,
              private chatsService: ChatsService) {}

  @WebSocketServer() server: Server

  private logger: Logger = new Logger('ChatGateway')
  // private channels: string[] = []

  /**
   * Hook when the gateway server is initiated
   * @param {Server} server
   */
  afterInit(server: Server) {
    this.logger.log('Gateway server initiated');
  }

  /**
   * Hook when a client is connecting to the server
   * @param {Socket} client
   * @param {any[]} args
   */
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client ${client.id} connected`);
    this.websocketService.sendOnlineClientsToClient(client)
  }

  /**
   * Hook when a client disconnect from the server
   * @param {Socket} client
   */
  handleDisconnect(client: Socket) {
    let sub
    this.logger.log(`Client ${client.id} disconnected`);
    if ((sub = this.websocketService.removeClient(client.id, this.server)) !== -1) {
      this.logger.log(`User with id ${sub} is now offline`)
    }
  }

  /**
   * Event userOnline
   * This event is triggered when the user is connected
   * It is used to prevent the server that the user is now online
   * @param {Socket} client
   * @param {ClientInterface} payload
   */
  @UseGuards(WsJwtAuthGuard)
  @UseFilters(new UnauthorizedExceptionFilter())
  @SubscribeMessage("userOnline")
  userOnlineEvent(client: Socket, payload: ClientInterface) {
    const { sub } = (client.handshake as any).user
    if (sub === payload.userId) {
      this.websocketService.addClient(client, payload, this.server)
      this.logger.log(`User with id ${sub} is now online`)
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @UseFilters(new UnauthorizedExceptionFilter())
  @SubscribeMessage('msgToServer')
  async msgToServerEvent(client: Socket, payload: SendMessageDto): Promise<void> {
    await this.chatsService.pushMsgInChannel(payload)
    let messages = await this.chatsService.getMessageFromChannel(payload.channel)
    this.server.emit('SendMessagesToClient', messages)
  }


  @UseGuards(WsJwtAuthGuard)
  @UseFilters(new UnauthorizedExceptionFilter())
  @SubscribeMessage('createChannel')
  createChannelEvent(client: Socket, payload: CreateChannelDto): void {
    const { sub } = (client.handshake as any).user
    payload.user_id = sub
    this.chatsService.createChannel(payload).then((res) => {
      this.getChannelsEvent(client)
    })
  }

  @UseGuards(WsJwtAuthGuard)
  @UseFilters(new UnauthorizedExceptionFilter())
  @SubscribeMessage('getChannels')
  getChannelsEvent(client: Socket): void {
    const { sub } = (client.handshake as any).user

    this.chatsService.findAllChannel(sub).then((res) => {
      this.server.emit('getChannels', res)
    })
  }

  @UseGuards(WsJwtAuthGuard)
  @UseFilters(new UnauthorizedExceptionFilter())
  @SubscribeMessage('getMsgs')
  async getMessagesEvent(client: Socket, channel: string): Promise<void> {
    console.log("getmsg: channel:" + channel)
    const messages = await this.chatsService.getMessageFromChannel(channel)
    this.server.emit('SendMessagesToClient', messages)
  }
}

