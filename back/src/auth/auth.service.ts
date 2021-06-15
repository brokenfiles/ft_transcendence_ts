import {HttpService, Injectable} from '@nestjs/common';
import {UsersService} from "../users/users.service";
import {User} from "../users/entities/user.entity";
import {JwtService} from "@nestjs/jwt";
import {WebsocketService} from "../gateways/websocket/websocket.service";

@Injectable()
export class AuthService {

    constructor(private usersService : UsersService,
                private readonly jwtService: JwtService,
                private readonly httpService: HttpService,
                private readonly websocketService: WebsocketService
    ) {}

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

    async generateToken(payload: any, args?: any): Promise<string> {
        return this.jwtService.sign(payload, args)
    }

    async refreshToken(refreshToken: string): Promise<any | null> {
        const payload = await this.validateToken(refreshToken)
        if (payload) {
            return this.generateToken({
                username: payload.username,
                sub: payload.sub,
                role: payload.role
            })
        } else {
            return null
        }
    }

    async getFortyTwoUser(code: string): Promise<any | null>
    {
        try {
            const tokens = await this.httpService.post(`https://api.intra.42.fr/oauth/token?grant_type=authorization_code&client_id=${process.env.FORTYTWO_OAUTH_UID}&client_secret=${process.env.FORTYTWO_OAUTH_SECRET}&code=${code}&redirect_uri=http://localhost:3000/auth/42`)
                .toPromise()
                .then(response => response.data)
            const fortyTwoUser = await this.httpService.get(`https://api.intra.42.fr/v2/me`,{
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`
                }
            }).toPromise().then(response => response.data)
            return (fortyTwoUser)
        } catch (err) {
            return null
        }
    }


}
