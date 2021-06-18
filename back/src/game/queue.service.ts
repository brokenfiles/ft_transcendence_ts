import {Injectable} from "@nestjs/common";
import {UserInterface} from "./interfaces/queue.iterfaces";
import {User} from "../users/entities/user.entity";
import {Socket} from "socket.io";
import {WebsocketService} from "../gateways/websocket/websocket.service";
import {UsersService} from "../users/users.service";

@Injectable()
export class QueueService {

    constructor(private websocketService: WebsocketService,
                private userService: UsersService) {}

    queue: number[]

    async addPlayerToQueue(client: Socket, payload: UserInterface) {


    }
}