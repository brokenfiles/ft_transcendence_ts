import {Socket} from "socket.io";

export interface ClientInterface {

    id: string

    socket: Socket

    userId: number

    channelId: number

}
