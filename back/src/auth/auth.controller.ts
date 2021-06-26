import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus, Logger,
    Post,
    Req,
    Res,
    UseGuards
} from "@nestjs/common";
import {Response} from "express";
import {AuthService} from "./auth.service";
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import {jwtConstants} from "./constants";
import {LoginDto} from "./dto/login.dto";
import {RefreshDto} from "./dto/refresh.dto";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {JwtAuthGuard} from "./jwt-auth.guard";
import {WebsocketService} from "../gateways/websocket/websocket.service";
import * as moment from 'moment';
import {log} from "util";
const crypto = require('crypto')

@Controller("/auth/42")
export class AuthController {

    constructor(private readonly authService: AuthService,
                private readonly jwtService: JwtService,
                private readonly websocketService: WebsocketService,
                private readonly usersService: UsersService) {}

    private logger: Logger = new Logger('AuthController')

    @UseGuards(JwtAuthGuard)
    @Get("/me")
    async me(@Req() request, @Res() response: Response) {
        const user = await this.usersService.findOne(request.user.sub)
        return response.status(200).json(user)
    }

    @Post("/refresh")
    async refresh(@Body() refreshDto: RefreshDto, @Res() response: Response) {
        const refreshToken = refreshDto.refresh_token
        const newAccessToken = await this.authService.refreshToken(refreshToken)
        if (newAccessToken) {
            this.logger.log(`A user refreshed his token`)
            return response.status(200).json({
                access_token: newAccessToken,
                expires_in: jwtConstants.expiresIn
            })
        } else {
            return response.status(401).json({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Invalid token.'
            })
        }
    }

    @Post("/token")
    async callback(@Body() body: LoginDto, @Res() res: Response) {
        const code = body.code
        const double_auth_code = body.double_auth_code
        let user = null
        if (code === '-1') {
            user = await this.usersService.findByDoubleAuthCode(double_auth_code)
            if (!user)
                throw new HttpException({ error: '2 auth code invalid', type: 'missing_2fa'}, HttpStatus.UNAUTHORIZED)
        } else {
            const fortyTwoUser = await this.authService.getFortyTwoUser(code)
            if (!fortyTwoUser) {
                throw new HttpException({
                    error: `42 user can't be found`
                }, HttpStatus.BAD_REQUEST)
            }
            user = await this.authService.findUserFromLogin(fortyTwoUser.login)
            if (user === null) {
                let dto = new CreateUserDto()
                    .set_avatar(fortyTwoUser.image_url)
                    .set_display_name(fortyTwoUser.displayname)
                    .set_first_name(fortyTwoUser.first_name)
                    .set_login(fortyTwoUser.login)
                    .set_email(fortyTwoUser.email)

                user = await this.usersService.create(dto)
            }
        }
        if (user.double_auth)  {
            if (!double_auth_code) {
                const token = crypto.randomBytes(12).toString('hex')
                await this.usersService.setDoubleAuthToken(user.id, token)
                throw new HttpException({
                    error: 'Please enter the 2fa code you received by mail',
                    type: 'missing_2fa'
                }, HttpStatus.UNAUTHORIZED)
            } else {
                if (double_auth_code !== user.double_auth_token)
                    throw new HttpException({
                        error: 'Your 2 factor authentication code is invalid',
                        type: 'missing_2fa'
                    }, HttpStatus.UNAUTHORIZED)
                else
                    await this.usersService.removeDoubleAuthToken(user.id)
            }
        }
        if (new Date(user.banned) > new Date()) {
            const formattedDate = moment.duration( moment(new Date(user.banned)).diff(moment()) ).asDays().toFixed(0)
            throw new HttpException({
                error: `You are banned ${formattedDate} days for the following reason: ${user.ban_reason}`
            }, HttpStatus.UNAUTHORIZED)
        }
        const payload = {
            username: user.display_name,
            sub: user.id,
            role: user.role
        }
        const access_token = await this.authService.generateToken(payload)
        const refresh_token = await this.authService.generateToken(payload, {
            expiresIn: `${60 * 60 * 24 * 30}s`
        })

        this.logger.log(`A user gets a new access & refresh token`)
        return res.status(200).json({
            access_token,
            refresh_token,
            expires_in: jwtConstants.expiresIn,
        })
    }

    /**
     * Pour utiliser ce endpoint : faire un GET sur http://localhost:4000/auth/42/faketoken?user=<user>
     * @param req
     * @param res
     */
    @Get("/faketoken")
    async callbackFake(@Req() req, @Res() res: Response) {
        const guest_user = `guest_${req.query.user}`
        let user = await this.authService.findUserFromLogin(guest_user)
        if (user === null) {
            let dto = new CreateUserDto()
                .set_avatar(`https://image.noelshack.com/fichiers/2021/25/6/1624723618-img-5283.jpg`)
                .set_display_name(guest_user)
                .set_first_name(guest_user)
                .set_login(guest_user)

            user = await this.usersService.create(dto)
        }
        if (new Date(user.banned) > new Date()) {
            const formattedDate = moment.duration( moment(new Date(user.banned)).diff(moment()) ).asDays().toFixed(0)
            throw new HttpException({
                error: `You are banned ${formattedDate} days for the following reason: ${user.ban_reason}`
            }, HttpStatus.UNAUTHORIZED)
        }
        const payload = {
            username: user.display_name,
            sub: user.id,
            role: user.role
        }
        const access_token = await this.authService.generateToken(payload)
        const refresh_token = await this.authService.generateToken(payload, {
            expiresIn: `${60 * 60 * 24 * 30}s`
        })

        this.logger.log(`A user gets a new access & refresh token`)
        return res.status(200).json({
            access_token,
            refresh_token,
            expires_in: jwtConstants.expiresIn,
        })
    }

}
