import {Module} from "@nestjs/common";
import {CdnController} from "./cdn.controller";
import {CdnService} from "./cdn.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Picture} from "./entites/picture.entity";
import {UsersModule} from "../users/users.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Picture]),
        UsersModule,
    ],
    controllers: [CdnController],
    providers: [CdnService]
})
export class CdnModule {}
