import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from "@nestjs/common";
import {Achievement} from "./entities/achievement.entity";
import {AchievementsService} from "./achievements.service";
import {UpdateAchievementDto} from "./dtos/update-achievement.dto";
import {CreateAchievementDto} from "./dtos/create-achievement.dto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {RolesGuard} from "../auth/roles/roles.guard";
import {Role} from "../auth/roles/enums/role.enum";
import {Roles} from "../auth/roles/roles.decorator";

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

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Moderator, Role.Administrator)
    create(@Body() createAchievementDto: CreateAchievementDto): Promise<Achievement> {
        return this.achievementsService.create(createAchievementDto)
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Moderator, Role.Administrator)
    update(@Param("id") id: number, @Body() updateAchievementDto: UpdateAchievementDto): Promise<Achievement> {
        return this.achievementsService.update(id, updateAchievementDto)
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Moderator, Role.Administrator)
    remove(@Param("id") id: number): Promise<Achievement> {
        return this.achievementsService.remove(id)
    }

}
