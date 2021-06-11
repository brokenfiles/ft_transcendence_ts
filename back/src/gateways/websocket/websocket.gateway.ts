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
import {PrivacyEnum} from "../../chat/enums/privacy.enum";

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
    const channel = await this.chatsService.findOneChannel(payload.channel)
    if (channel)
    {

      let users_id = channel.users.map((u) => u.id)
      for (const user of users_id) {
        const index = this.websocketService.onlineClients.indexOf(user)
        if (index !== -1) {
          // console.log(this.websocketService.clients[index].userId);
          this.websocketService.clients[index].socket.emit('SendMessagesToClient', messages)
        }
      }
    }
  }


  @UseGuards(WsJwtAuthGuard)
  @UseFilters(new UnauthorizedExceptionFilter())
  @SubscribeMessage('createChannel')
  createChannelEvent(client: Socket, payload: CreateChannelDto): void {
    const {sub} = (client.handshake as any).user
    this.chatsService.createChannel(payload, sub).then((res) => {

      if (res.privacy === PrivacyEnum.PUBLIC) {
        this.chatsService.findAllChannel(sub).then((c) => {
          this.server.emit('getChannels', c)
        })
      }
      else {
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
    const { sub } = (client.handshake as any).user
    this.chatsService.findAllChannel(sub).then((res) => {
      client.emit('getChannels', res)
    })
  }

  @UseGuards(WsJwtAuthGuard)
  @UseFilters(new UnauthorizedExceptionFilter())
  @SubscribeMessage('getMsgs')
  async getMessagesEvent(client: Socket, channel: string): Promise<void> {
    const messages = await this.chatsService.getMessageFromChannel(channel)
    client.emit('SendMessagesToClient', messages)
  }
}

