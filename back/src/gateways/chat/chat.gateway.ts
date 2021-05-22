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
import {ClientInterface} from "./interfaces/client.interface";

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
  private clients: ClientInterface[] = []
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

  @SubscribeMessage("loggedIn")
  loggedInEvent(client: Socket, payload: ClientInterface) {
    payload.id = client.id
    if (this.clients.filter(client => client.userId == payload.userId).length == 0) {
      this.clients.push(payload)
      this.server.emit('onlineStateUpdated', {
        userId: payload.userId,
        online: true
      })
    }
  }

  @SubscribeMessage("isOnline")
  isOnlineEvent(client: Socket, userId: number) {
    this.server.emit('onlineState', this.clients.map(client => client.userId).indexOf(userId) !== -1)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
    const index = this.clients.map(clt => clt.id).indexOf(client.id)
    if (index !== -1) {
      this.server.emit('onlineStateUpdated', {
        userId: this.clients[index].userId,
        online: false,
      })
      this.clients.splice(index, 1)
    }
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client ${client.id} connected`);
    // this.clients.push(client)
  }

  private sendChannels(client: Socket) {
    client.emit('channels', this.channels)
  }
}

