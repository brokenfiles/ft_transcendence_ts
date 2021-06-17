import {Coordinates} from "~/pages/game/classes/coordinates.interface";

export class Pad {

    coordinates: Coordinates = {
        x: 0,
        y: 0
    }
    w: number;
    h: number;

    constructor(x: number, y: number, w: number, h: number) {
        this.coordinates = {
            x: x,
            y: y
        }
        this.w = w
        this.h = h
    }

    draw(context: CanvasRenderingContext2D | null, vector: string) {

        context?.clearRect(this.coordinates.x, this.coordinates.y, this.w, this.h)
        if (vector === "UP") {
            this.coordinates.y += 5
            if (this.coordinates.y + 74 > 480)
                this.coordinates.y = 480 - 74
        } else if (vector === "DOWN") {
            this.coordinates.y -= 5
            if (this.coordinates.y < 0)
                this.coordinates.y = 0
        }
        context?.beginPath();
        context?.fillRect(this.coordinates.x, this.coordinates.y, this.w, this.h)
    }
}