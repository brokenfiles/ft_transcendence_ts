import {Controller, Delete, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors} from "@nestjs/common";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {FileInterceptor} from "@nestjs/platform-express";
import {Express, Response} from "express";
import {CdnService} from "./cdn.service";
import {diskStorage} from "multer";
import {editFileName} from "./cdn.middleware";
import {imageFileFilter} from "./cdn.filters";
import {RolesGuard} from "../auth/roles/roles.guard";
import {Roles} from "../auth/roles/roles.decorator";
import {Role} from "../auth/roles/enums/role.enum";

@Controller("cdn")
export class CdnController {

    constructor(private cdnService: CdnService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    findAll() {
        return this.cdnService.findAll()
    }

    @Get(":uuid.:ext")
    async findOne(@Param('uuid') uuid: string, @Res() res: Response) {
        const picture = await this.cdnService.findOne(uuid)
        return res.sendFile(`${picture.name}`, {root: './uploads'})
    }

    @Delete(":uuid")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Administrator)
    async remove(@Param('uuid') uuid: string) {
        return this.cdnService.remove(uuid)
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: editFileName
            }),
            fileFilter: imageFileFilter
        })
    )
    create(@Req() request, @UploadedFile() file: Express.Multer.File) {
        return this.cdnService.saveFile(request.user.sub, request.user.role, file.filename)
    }

}
