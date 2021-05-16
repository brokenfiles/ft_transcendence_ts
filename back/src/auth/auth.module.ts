import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {UsersModule} from "../users/users.module";
import {PassportModule} from "@nestjs/passport";
import {AuthController} from "./auth.controller";
import {JwtModule} from "@nestjs/jwt";
import {jwtConstants} from "./constants"
import {JwtStrategy} from "./jwt.strategy";

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: {
                expiresIn: jwtConstants.expiresIn
            },
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtModule, JwtStrategy]
})
export class AuthModule {
}
