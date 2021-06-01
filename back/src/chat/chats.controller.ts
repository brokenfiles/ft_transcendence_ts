import {Body, Controller, Get, Post, Req} from "@nestjs/common";
import {ChatsService} from "./chats.service";
import {Request} from "express";

@Controller('chats')
export class ChatsController {

    constructor(private readonly chatsService : ChatsService) {}

    @Get("messages")
    findAllMessages(@Req() req: Request) {
            return this.chatsService.findAllMessages()
    }

    @Get("channels")
    findAllChannels(@Req() req: Request) {
        return this.chatsService.findAllChannel()
    }

    @Post("channels")
    CreateChannel(@Body() body) {
        return this.chatsService.createChannel(body.name)
    }

}