import {Module} from "@nestjs/common";
import {AchievementsController} from "./achievements.controller";
import {AchievementsService} from "./achievements.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Achievement} from "./entities/achievement.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Achievement])
    ],
    controllers: [AchievementsController],
    providers: [AchievementsService],
    exports: [AchievementsService]
})
export class AchievementsModule {}
