import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {jwtConstants} from "./constants";

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, 'ws-jwt') {

    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret
        });
    }

    async validate(payload: any) {
        return {
            username: payload.username,
            sub: payload.sub
        }
    }

}
