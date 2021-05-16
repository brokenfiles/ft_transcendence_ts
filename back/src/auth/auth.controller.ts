import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Req,
    Request,
    Res,
    UseGuards
} from "@nestjs/common";
import axios from "axios";
import {Response} from "express";
import {AuthService} from "./auth.service";
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import {jwtConstants} from "./constants";
import {LoginDto} from "./dto/login.dto";
import {RefreshDto} from "./dto/refresh.dto";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {JwtAuthGuard} from "./jwt-auth.guard";

@Controller("/auth/42")
export class AuthController {

    constructor(private readonly authService: AuthService, private readonly jwtService: JwtService, private readonly usersService: UsersService) {}

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
        const fortyTwoUser = await this.authService.getFortyTwoUser(code)
        if (!fortyTwoUser) {
            throw new HttpException({
                error: `42 user can't be found`
            }, HttpStatus.BAD_REQUEST)
        }
        let user = await this.authService.findUserFromLogin(fortyTwoUser.login)
        if (user === null) {
            let dto = new CreateUserDto()
                .set_avatar(fortyTwoUser.image_url)
                .set_display_name(fortyTwoUser.displayname)
                .set_first_name(fortyTwoUser.first_name)
                .set_login(fortyTwoUser.login)

            user = await this.usersService.create(dto)
        }
        const payload = {
            username: user.display_name,
            sub: user.id
        }
        const access_token = await this.authService.generateToken(payload)
        const refresh_token = await this.authService.generateToken(payload, {
            expiresIn: `${60 * 60 * 24 * 30}s`
        })

        return res.status(200).json({
            access_token,
            refresh_token,
            expires_in: jwtConstants.expiresIn,
        })

    }

}