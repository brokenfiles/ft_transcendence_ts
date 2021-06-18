import {Coordinates} from "~/utils/interfaces/game/coordinates.interface";

export class Ball {

    coordinates: Coordinates = {
        x: 0,
        y: 0
    }
    h: number = 0
    w: number = 0
    color: number = 0xfff
    xSpeed: number = 0
    ySpeed: number = 0

    constructor(x: number, y: number, w: number, h: number, color: number, xSpeed: number, ySpeed: number) {
        this.coordinates.x = x
        this.coordinates.y = y
        this.w = w
        this.h = h
        this.color = color
        this.xSpeed = xSpeed
        this.ySpeed = ySpeed
    }

    drawNextPosition(context: CanvasRenderingContext2D | null) {
        context?.clearRect(this.coordinates.x, this.coordinates.y, this.w, this.h)
        this.coordinates.x += this.xSpeed
        this.coordinates.y += this.ySpeed
        if (this.coordinates.y <= 0 || this.coordinates.y + this.h / 2 >= 480)
            this.ySpeed *= -1
        if (this.coordinates.x <= 0 || this.coordinates.x + this.w / 2 >= 640)
            this.xSpeed *= -1
        context?.beginPath()
        context?.fillRect(this.coordinates.x, this.coordinates.y, this.w, this.h)
    }

}
