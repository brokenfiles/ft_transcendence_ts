import {HttpException, HttpStatus, Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Picture} from "./entites/picture.entity";
import {Repository} from "typeorm";
import {UsersService} from "../users/users.service";
import {unlink} from "fs";
import {Role} from "../auth/roles/enums/role.enum";
import config from "../../configuration/config";
let path = require('path')

@Injectable({})
export class CdnService {

    constructor(@InjectRepository(Picture) private pictureRepository: Repository<Picture>,
                private usersService: UsersService) {}

    private logger: Logger = new Logger('CDN')

    async findAll(): Promise<Picture[]> {
        return this.pictureRepository.find()
    }

    async findOne(uuid: string): Promise<Picture> {
        return this.pictureRepository.findOneOrFail({uuid})
            .catch(() => {
                throw new HttpException({
                    message: [
                        'Picture not found'
                    ]
                }, HttpStatus.NOT_FOUND)
            })
    }

    async saveFile(sub: number, role: Role, filename: string): Promise<Picture> {
        const user = await this.usersService.findOne(sub, ['pictures'])
        const limits = config.cdn.limits
        if (user.pictures.length >= limits[role]) {
            await this.remove(user.pictures[0].uuid)
        }
        let picture = this.pictureRepository.create({
            name: filename,
            extension: path.extname(filename),
            user
        })
        return this.pictureRepository.save(picture)
    }

    async remove(uuid: string): Promise<Picture> {
        const picture = await this.findOne(uuid)
        unlink(`./uploads/${picture.name}`, () => {
            this.logger.log(`Picture ${picture.uuid} deleted`)
        })
        return this.pictureRepository.remove(picture)
    }
}
