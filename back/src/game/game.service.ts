import {Injectable} from "@nestjs/common";
import {Pad, Ball, GameInterface, createGamePayload} from "./interfaces/game.interfaces";

@Injectable()
export class GameService {


    gameInterface: GameInterface = new class implements GameInterface {
        ball: Ball;
        gameHeight: number;
        gameWith: number;
        leftPad: Pad;
        rightPad: Pad;
    }

    constructor() {

    }

    createGame(payload: createGamePayload) {

        this.gameInterface.ball = payload.ball
        this.gameInterface.rightPad = payload.rightPad
        this.gameInterface.leftPad = payload.leftPad
        this.gameInterface.gameWith = 640
        this.gameInterface.gameHeight = 480
    }

    updatePadCoordinates(padPayload: Pad) {
        this.gameInterface.rightPad = padPayload
    }

    updateBall(ballPayload: Ball) {
        this.gameInterface.ball = ballPayload
        console.log("new position for ", this.gameInterface.ball)

    }
}