import { Injectable } from '@nestjs/common';
import {UsersService} from "../users/users.service";

@Injectable()
export class AuthService {

    constructor(private usersService : UsersService) {}

    async validateUser(displayName: string, password: string): Promise<any> {
        const user = await this.usersService.findByDisplayName(displayName)
        if (user) {
            return user
        }
        return null
    }

}
