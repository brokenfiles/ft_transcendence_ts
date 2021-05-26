import {
  OnGatewayConnection, OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import {Logger, UseFilters, UseGuards} from "@nestjs/common";
import {Server, Socket} from 'socket.io'
import {ChatService} from "./chat.service";
import {ClientInterface} from "./interfaces/client.interface";
import {WsJwtAuthGuard} from "../../auth/ws-jwt-auth.guard";
import {UnauthorizedExceptionFilter} from "./exceptions/UnauthorizedExceptionFilter";

@WebSocketGateway(81,
    {
      cors: {
        origin: "http://localhost:3000",
        credentials: true
      }
    })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private chatService: ChatService) {}

  @WebSocketServer() server: Server

  private logger: Logger = new Logger('ChatGateway')
  private channels: string[] = []

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
    this.chatService.sendOnlineClientsToClient(client)
  }

  /**
   * Hook when a client disconnect from the server
   * @param {Socket} client
   */
  handleDisconnect(client: Socket) {
    let sub
    this.logger.log(`Client ${client.id} disconnected`);
    if ((sub = this.chatService.removeClient(client.id, this.server)) !== -1) {
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
      this.chatService.addClient(client, payload, this.server)
      this.logger.log(`User with id ${sub} is now online`)
    }
  }

  @SubscribeMessage('msgToServer')
  msgToServerEvent(client: Socket, payload: string): void {
    this.logger.log(`Received message from ${client.id} : ${payload}`)
    this.server.emit('msgToClient', payload)
  }

  @SubscribeMessage('createChannel')
  createChannelEvent(client: Socket, payload: string): void {
    this.logger.log(`Client ${client.id} created channel ${payload}`)
    this.channels.push(payload)
    // this.server.emit('channels', this.channels)
    this.sendChannels(client)
  }

  @SubscribeMessage('getChannels')
  getChannelsEvent(client: Socket) : void {
    this.logger.log(`Client ${client.id} requested the channels`)
    this.sendChannels(client)
  }

  private sendChannels(client: Socket) {
    client.emit('channels', this.channels)
  }

}

