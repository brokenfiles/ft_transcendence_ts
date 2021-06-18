import {Injectable} from "@nestjs/common";
import {GameClass} from "./classes/game.classes";
import {Socket} from "socket.io";
import {SchedulerRegistry} from "@nestjs/schedule";
import {CreateGameInterface, PadInterface} from "./interfaces/game.interfaces";

@Injectable()
export class GameService {

    game: GameClass

    constructor(private schedulerRegistry: SchedulerRegistry) {}

    createGame(payload: CreateGameInterface) {
        this.game = new GameClass(payload)
    }

    updatePadCoordinates(padPayload: PadInterface) {
        this.game.rightPad.setCoordinates(padPayload)
    }

    userIsReady(client: Socket, state: boolean) : boolean {

        if (state === true) {
            const interval = setInterval(() => {


                if (this.game.ball.updatePosition(this.game))
                {
                    client.emit("BallHit", this.game.ball)
                }
            }, 20);
            this.schedulerRegistry.addInterval("game", interval);
        }
        else
        {
            this.schedulerRegistry.deleteInterval("game");
        }
        const intervals = this.schedulerRegistry.getIntervals();
        console.log(intervals)
        return state
    }
}