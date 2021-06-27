import {Body, HttpException, HttpStatus, Injectable, Param} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Achievement} from "./entities/achievement.entity";
import {Repository} from "typeorm";
import {CreateAchievementDto} from "./dtos/create-achievement.dto";
import {UpdateAchievementDto} from "./dtos/update-achievement.dto";
import {CreateAchievementInterface} from "./interfaces/create-achievement.interface";

@Injectable()
export class AchievementsService {

    constructor(@InjectRepository(Achievement) private achievementRepository: Repository<Achievement>) {}

    async findOne(id: number): Promise<Achievement> {
        return this.achievementRepository.findOneOrFail(id, {
            relations: ['users']
        })
            .catch((err) => {
                throw new HttpException({
                    error: err.message
                }, HttpStatus.BAD_REQUEST)
            })
    }

    async findOneByName (name: string) {
        return this.achievementRepository.findOne({ name })
    }

    async findAchievement(achievementName: string, achievementPayload: CreateAchievementInterface) : Promise<Achievement | undefined> {
        let achievement = await this.findOneByName(achievementName)
        if (achievement === undefined)
            achievement = await this.addNew(achievementPayload)
        return achievement
    }

    async find(): Promise<Achievement[]> {
        return this.achievementRepository.find()
    }

    async create(createAchievementDto: CreateAchievementDto): Promise<Achievement> {
        const achievement = this.achievementRepository.create(createAchievementDto)
        return this.achievementRepository.save(achievement)
    }

    async addNew(createAchievement: CreateAchievementInterface) : Promise<Achievement> {
        const achievement = this.achievementRepository.create(createAchievement)
        return this.achievementRepository.save(achievement)
    }

    async update(id: number, updateAchievementDto: UpdateAchievementDto): Promise<Achievement> {
        let achievement = await this.findOne(id)
        Object.assign(achievement, updateAchievementDto)
        return this.achievementRepository.save(achievement)
            .catch((err) => {
                throw new HttpException({
                    error: err.message
                }, HttpStatus.BAD_REQUEST)
            })
    }

    async remove(id: number): Promise<Achievement> {
        const user = await this.findOne(id)
        return this.achievementRepository.remove(user)
    }
}
