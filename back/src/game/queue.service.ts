import {Injectable} from "@nestjs/common";
import {Socket} from "socket.io";
import {WebsocketService} from "../gateways/websocket/websocket.service";
import {UsersService} from "../users/users.service";

@Injectable()
export class QueueService {

    constructor(private websocketService: WebsocketService,
                private userService: UsersService) {
    }

    queue: number[] = []

    async addPlayerToQueue(client: Socket) {
        const {sub} = (client.handshake as any).user
        const newUser = await this.userService.findOne(sub)
        const newClient = this.websocketService.getClient(sub)
        if (newClient) {
            if (this.queue.length === 0) {
                this.queue.push(sub)
            } else if (this.queue.length === 1) {
                const firstClient = this.websocketService.getClient(this.queue[0])
                if (firstClient) {
                    firstClient.socket.emit('clientJoinedQueue', newUser)
                } else {
                    this.queue.shift()
                }
                this.queue.push(sub)
                newClient.socket.emit('clientJoinedQueue', await this.userService.findOne(firstClient.userId))
            } else {
                this.queue = []
            }

            if (this.queue.length === 2) {
                const players = await Promise.all(this.queue.map(userId => this.userService.findOne(userId)))
                for (const clientId of this.queue) {
                    const client = this.websocketService.getClient(clientId)
                    if (client) {
                        client.socket.emit('gameStarting', players)
                    }
                }
                this.queue = []
            }
        }
    }
}
