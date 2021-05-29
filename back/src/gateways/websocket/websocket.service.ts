import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Channel} from "./entities/channel.entity";
import {Repository} from "typeorm";
import {Message} from "./entities/message.entity";
import {Server, Socket} from "socket.io";
import {ClientInterface} from "./interfaces/client.interface";
import {NotifyOptions} from "./interfaces/notification/notify.options.interface";

@Injectable()
export class WebsocketService {

    private _clients: ClientInterface[] = []

    constructor(
        @InjectRepository(Channel) private channelRepository: Repository<Channel>,
        @InjectRepository(Message) private messageRepository: Repository<Message>)
    {}

    broadcastOnlineClients(server: Server) {
        server.emit('onlineClientsUpdated', this.onlineClients)
    }

    sendOnlineClientsToClient(client: Socket) {
        client.emit('onlineClientsUpdated', this.onlineClients)
    }

    /**
     * Notify a list of users (by their IDs)
     * @param users
     * @param options
     */
    public notify(users: number[] = this.onlineClients, options: NotifyOptions) {
        for (const user of users) {
            const index = this.clients.map(client => client.userId).indexOf(user)
            if (index !== -1)
                this.clients[index].socket.emit('notification', options)
        }
    }

    public addClient(client: Socket, payload: ClientInterface, server: Server) {
        payload.id = client.id
        payload.socket = client
        if (this._clients.filter(client => client.userId == payload.userId).length == 0) {
            this._clients.push(payload)
            this.broadcastOnlineClients(server)
        }
    }

    public removeClient(clientUid: string, server: Server): number {
        const index = this._clients.map(clt => clt.id).indexOf(clientUid)
        if (index !== -1) {
            const sub = this._clients[index].userId
            this._clients.splice(index, 1)
            this.broadcastOnlineClients(server)
            return sub
        }
        return (-1)
    }

    public get onlineClients() {
        return this._clients.map(client => client.userId)
    }

    public get clients() {
        return this._clients
    }

    // async createChannel(channelOptions: any): Promise<Channel> {
    //     const channel = this.channelRepository.create(channelOptions)
        // return (this.channelRepository.save(channel))
    // }
}
