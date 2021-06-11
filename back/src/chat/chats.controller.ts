import {Body, Controller, Get, Post, Req} from "@nestjs/common";
import {ChatsService} from "./chats.service";
import {Request} from "express";

@Controller('chats')
export class ChatsController {

    constructor(private readonly chatsService : ChatsService) {}

}