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

@Controller("/auth/42")
export class AuthController {

    constructor(private readonly authService: AuthService, private readonly jwtService: JwtService, private readonly usersService: UsersService) {}

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
        const fortyTwoUser = await this.authService.getFortyTwoUser(code)
        if (!fortyTwoUser) {
            throw new HttpException({
                error: `42 user can't be found`
            }, HttpStatus.BAD_REQUEST)
        }
        // fortyTwoUser.login = 'timlecou'
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
     * TODO: REMOVE THIS THIS IS A FAKE TOKEN AUTHENTIFICATION
     * Pour utiliser ce endpoint : faire un GET sur http://localhost:4000/auth/42/faketoken?user=<user>
     * @param req
     * @param res
     */
    @Get("/faketoken")
    async callbackFake(@Req() req, @Res() res: Response) {
        let user = await this.authService.findUserFromLogin(req.query.user)
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
