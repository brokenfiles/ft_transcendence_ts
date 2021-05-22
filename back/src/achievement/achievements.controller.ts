import {Body, Controller, Delete, Get, Param, Patch, Post} from "@nestjs/common";
import {Achievement} from "./entities/achievement.entity";
import {AchievementsService} from "./achievements.service";
import {UpdateAchievementDto} from "./dtos/update-achievement.dto";
import {CreateAchievementDto} from "./dtos/create-achievement.dto";

@Controller("achievements")
export class AchievementsController {

    constructor(private readonly achievementsService: AchievementsService) {}

    @Get()
    findAll(): Promise<Achievement[]> {
        return this.achievementsService.find()
    }

    @Get(":id")
    findOne(@Param("id") id: number): Promise<Achievement> {
        return this.achievementsService.findOne(id)
    }

    @Patch(":id")
    update(@Param("id") id: number, @Body() updateAchievementDto: UpdateAchievementDto): Promise<Achievement> {
        return this.achievementsService.update(id, updateAchievementDto)
    }

    @Delete(":id")
    remove(@Param("id") id: number): Promise<Achievement> {
        return this.achievementsService.remove(id)
    }

    @Post()
    create(@Body() createAchievementDto: CreateAchievementDto): Promise<Achievement> {
        return this.achievementsService.create(createAchievementDto)
    }

}
