import {
  OnGatewayConnection, OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import {Logger} from "@nestjs/common";
import {Server, Socket} from 'socket.io'
import {ChatService} from "./chat.service";

@WebSocketGateway(81)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private chatService: ChatService) {}

  @WebSocketServer() server: Server

  private logger: Logger = new Logger('ChatGateway')
  private channels: string[] = []
  // private clients: Socket[]

  @SubscribeMessage('msgToServer')
  msgToServerEvent(client: Socket, payload: string): void {
    this.logger.log(`Received message from ${client.id} : ${payload}`)
    this.server.emit('msgToClient', payload);
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

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client ${client.id} connected`);
    // this.clients.push(client)
  }

  private sendChannels(client: Socket) {
    client.emit('channels', this.channels)
  }
}

