import {Injectable} from "@nestjs/common";
import {Socket} from "socket.io";
import {WebsocketService} from "../gateways/websocket/websocket.service";
import {UsersService} from "../users/users.service";
import {GameService} from "./game.service";

@Injectable()
export class QueueService {

    constructor(private websocketService: WebsocketService,
                private userService: UsersService,
                private gameService: GameService) {
    }

    queue: number[] = []

    async addPlayerToQueue(client: Socket) {
        const {sub} = (client.handshake as any).user
        const newUser = await this.userService.findOne(sub)
        const newClient = this.websocketService.getClient(sub)
        if (newClient && !this.queue.includes(sub)) {
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
                const uuid = await this.gameService.initGame(players)
                for (const clientId of this.queue) {
                    const client = this.websocketService.getClient(clientId)
                    if (client) {
                        client.socket.emit('gameStarting', {
                            players, uuid
                        })
                    }
                }
                this.queue = []
            }
        }
    }

    async removeFromQueue(client: Socket) {
        const clientIdx = this.websocketService.clients.map(c => c.id).indexOf(client.id)
        if (clientIdx !== -1) {
            const client = this.websocketService.clients[clientIdx]
            const queueIdx = this.queue.indexOf(client.userId)
            if (queueIdx !== -1) {
                this.queue.splice(queueIdx, 1)
                if (this.queue.length === 1) {
                    const firstClient = this.websocketService.getClient(this.queue[0])
                    if (firstClient) {
                        firstClient.socket.emit('clientLeftQueue', client.userId)
                    }
                }
            }
        }
    }
}
