import { Injectable } from '@nestjs/common';
import {UsersService} from "../users/users.service";
import {User} from "../users/entities/user.entity";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class AuthService {

    constructor(private usersService : UsersService, private readonly jwtService: JwtService) {}

    async findUserFromLogin(login: string): Promise<User | null> {
        const user = await this.usersService.findByLogin(login)
        if (user)
            return (user)
        return null;
    }

    async validateToken(accessToken: string): Promise<any | null> {
        try {
            const content = await this.jwtService.verify(accessToken)
            return (content);
        } catch (err) {
            return null
        }
    }

    async getUserFromToken(accessToken: string): Promise<User | null>
    {
        const content = await this.validateToken(accessToken);
        if (content) {
            return await this.usersService.findOne(content.sub)
        } else {
            return null
        }
    }


}
