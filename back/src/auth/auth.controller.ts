import {Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards} from "@nestjs/common";
import axios from "axios";
import {Response, Request} from "express";
import {AuthService} from "./auth.service";
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import {jwtConstants} from "./constants";
import {LoginDto} from "./dto/login.dto";
import {RefreshDto} from "./dto/refresh.dto";
import {CreateUserDto} from "../users/dto/create-user.dto";

@Controller("/auth/42")
export class AuthController {

    constructor(private readonly authService: AuthService, private readonly jwtService: JwtService, private readonly usersService: UsersService) {}

    @Get("/me")
    async me(@Req() request: Request, @Res() response: Response) {
        const authHeader = request.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]
        if (!token) {
            return (response.status(403).json({
                statusCode: 403,
                error: 'Forbidden',
                message: 'Forbidden'
            }))
        }
        const user = await this.authService.getUserFromToken(token)
        if (user) {
            return response.status(200).json(user)
        } else {
            return response.status(401).json({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Invalid token.'
            })
        }
    }

    @Post("/refresh")
    async refresh(@Body() refreshDto: RefreshDto, @Res() response: Response) {
        const refreshToken = refreshDto.refresh_token
        const content = await this.authService.validateToken(refreshToken)
        delete content.exp
        delete content.iat
        if (content) {
            const access_token = this.jwtService.sign(content)
            return response.status(200).json({
                access_token,
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
        try {
            const tokens = await axios.post(`https://api.intra.42.fr/oauth/token?grant_type=authorization_code&client_id=${process.env.FORTYTWO_OAUTH_UID}&client_secret=${process.env.FORTYTWO_OAUTH_SECRET}&code=${code}&redirect_uri=http://localhost:3000/auth/42`)
                .then(response => response.data)
            const fortyTwoUser = await axios.get(`https://api.intra.42.fr/v2/me`,{
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`
                }
            }).then(response => response.data)

            let user = await this.authService.findUserFromLogin(fortyTwoUser.login)
            if (user === null) {
                let dto = new CreateUserDto()
                dto.display_name = fortyTwoUser.displayname
                dto.avatar = fortyTwoUser.image_url
                dto.login = fortyTwoUser.login
                dto.first_name = fortyTwoUser.first_name

                user = await this.usersService.create(dto)
            }

            const access_token = this.jwtService.sign({
                username: user.display_name,
                sub: user.id
            })
            const refresh_token = this.jwtService.sign({
                username: user.display_name,
                sub: user.id
            }, {
                expiresIn: `${60 * 60 * 24 * 30}s`
            })
            return res.status(200).json({
                access_token,
                refresh_token,
                expires_in: jwtConstants.expiresIn,
                // user: user
            })
            // send token to user

            return res.status(200).json(user)
        } catch (err) {
            return res.status(400).json(
                {
                    error: err.message
                })
        }
    }

}
