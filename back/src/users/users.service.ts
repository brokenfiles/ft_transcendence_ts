import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";
import {User} from "./entities/user.entity";
import {UpdateMeDto} from "./dto/update-me.dto";
import {WebsocketService} from "../gateways/websocket/websocket.service";
import {AchievementsService} from "../achievement/achievements.service";
import {CreateAchievementInterface} from "../achievement/interfaces/create-achievement.interface";

@Injectable()
export class UsersService {

    mailjet: any = null

    constructor(@InjectRepository(User) private usersRepository: Repository<User>,
                private chatService: WebsocketService,
                private achievementsService: AchievementsService) {
        this.mailjet = require ('node-mailjet')
            .connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_SECRET)
    }

    create(createUser: CreateUserDto): Promise<User> {
        const newUser = this.usersRepository.create(createUser)
        newUser.users_id_blocked = []
        return this.usersRepository.save(newUser)
    }

    findAll(): Promise<User[]> {
        return this.usersRepository.find({
            relations: [
                'guild', 'achievements', 'channels', 'messages'
            ]
        })
    }

    findAllOrderedByElo(): Promise<User[]> {
        return this.usersRepository.find({
            relations: [
                'guild'
            ],
            order: {
                elo: "DESC"
            },
            take: 15
        })
    }

    async findOne(id: number, relations: string[] = []): Promise<User> {
        const friends = await this.usersRepository.query(
            `SELECT *
              FROM Users U
              WHERE U.id <> $1
                AND EXISTS(
                      SELECT 1
                      FROM users_friends_users F
                      WHERE (F."usersId_1" = $1 AND F."usersId_2" = U.id)
                         OR (F."usersId_2" = $1 AND F."usersId_1" = U.id)
                  );`,
            [id],
        );

        let user = await this.usersRepository.findOneOrFail(id, {
            relations: [
                'guild', 'achievements', 'guild_request', 'channels_owned', 'channels_admin', ...relations
            ]
        }).catch((err) => {
            throw new HttpException({
                error: err.message
            }, HttpStatus.BAD_REQUEST)
        })
        user.friends = friends
        return Promise.resolve(user)
    }

    async findOneWithoutRelations (sub: number, relations: string[] = []) : Promise<User> {
        return this.usersRepository.findOneOrFail(sub, {
            relations
        }).catch((err) => {
            throw new HttpException({
                error: err.message
            }, HttpStatus.BAD_REQUEST)
        })
    }

    findByLogin(login) : Promise<User | undefined> {
        return this.usersRepository.findOne({
            where: {login: login},
            relations: ['guild', 'achievements']
        })
    }

    findByDoubleAuthCode(double_auth_code: string) {
        return this.usersRepository.findOne({
            where: {double_auth_token: double_auth_code},
            relations: ['guild', 'achievements']
        })
    }

    async update(id: number, updateUserDto: UpdateUserDto | UpdateMeDto) {
        let user = await this.findOne(id)
        Object.assign(user, updateUserDto)
        return this.usersRepository.save(user)
            .catch(() => {
                throw new HttpException({
                    message: [
                        `This display name is already taken`
                    ]
                }, HttpStatus.BAD_REQUEST)
            })
    }

    async updatePoints(id: number, points: number) {
        let user = await this.findOne(id)
        user.points = points
        return this.usersRepository.save(user)
    }

    async updateElo(id: number, elo: number) {
        let user = await this.findOne(id)
        user.elo = elo
        return this.usersRepository.save(user)
    }

    async checkAchievements(playersId: number[]) {
        let players = await Promise.all(playersId
            .map((p) => this.findOneWithoutRelations(p, ['achievements', 'games', 'games.winner', 'games.looser'])))
        for (const player of players) {
            const wins = player.games.filter((g) => g.winner.id === player.id)
            const loses = player.games.filter((g) => g.looser.id === player.id)
            if (player.games.length >= 30)
                await this.addAchievement(player, {
                    name: 'Beginner',
                    description: 'Play 30 games',
                    color: '#BB6BD9'
                })
            if (wins.length >= 50)
                await this.addAchievement(player, {
                    name: 'Challenger',
                    description: 'Win 50 games',
                    color: '#BB6BD9'
                })
            if (wins.length >= 200)
                await this.addAchievement(player, {
                    name: 'Fighter',
                    description: 'Win 200 games',
                    color: '#BB6BD9'
                })
            if (wins.length >= 500)
                await this.addAchievement(player, {
                    name: 'Champion',
                    description: 'Win 500 games',
                    color: '#BB6BD9'
                })
        }
    }

    async addAchievement (player: User, achievementPayload: CreateAchievementInterface) : Promise<User | undefined> {
        const achievement = await this.achievementsService.findAchievement(achievementPayload.name, achievementPayload)
        let playerAchievements = player.achievements
        if (!playerAchievements.map(a => a.id).includes(achievement.id)) {
            playerAchievements.push(achievement)
            return this.usersRepository.save(player)
        }
        return undefined
    }

    async findUsersByIds(users_id: number[]): Promise<User[]>
    {
        let users = await this.usersRepository.find({
            relations: ['channels', 'channels_admin', 'banned_channels', 'channels_owned'],
            where: {
                id: In(users_id)
            }
        })

        // const all_users = users.filter((u) => users_id.includes(u.id))

        return (users)
    }

    async remove(id: number): Promise<User> {
        const user = await this.findOne(id)
        return this.usersRepository.remove(user)
            .catch((err) => {
                throw new HttpException({
                    error: err.message
                }, HttpStatus.BAD_REQUEST)
            })
    }

    /**
     * Add the friend to user entity
     * @param requester
     * @param requested
     */
    async addFriend(requester: User, requested: User): Promise<User | undefined> {
        const alreadyFriends = requester.friends.map(friend => friend.id).indexOf(requested.id) !== -1
        if (!alreadyFriends)
            requester.friends.push(requested)
        return !alreadyFriends ? this.usersRepository.save(requester) : undefined
    }

    /**
     * Remove a friend
     * @param userId
     * @param friendId
     */
    async removeFriend(userId: number, friendId: number) {
        const friend1 = await this.usersRepository.findOne(userId, { relations: ['friends'] })
        const friend = await this.usersRepository.findOne(friendId, { relations: ['friends'] })
        // select the user containing friendship
        const user = friend1.friends
            .filter(fd => fd.id === friend.id || fd.id === friend1.id).length > 0 ? friend1 : friend
        const otherUser = friend1.friends
            .filter(fd => fd.id === friend.id || fd.id === friend1.id).length === 0 ? friend1 : friend
        const index = user.friends.map(fd => fd.id).indexOf(otherUser.id)
        if (index === -1)
            throw new HttpException({
                error: 'You are not friend with this user'
            }, HttpStatus.BAD_REQUEST)
        user.friends.splice(index, 1)
        this.chatService.notify([userId], {
            message: `You lost a friend :(`,
            fetchClient: true
        })
        return this.usersRepository.save(user)
    }

    /**
     * Returns a list of matched users
     * @param search
     */
    searchUser(search: string): Promise<User[]> {
        return this.usersRepository.query(`SELECT id, login, display_name, avatar FROM Users WHERE LOWER(login) LIKE CONCAT('%', $1::text, '%') OR LOWER(display_name) LIKE CONCAT('%', $1::text, '%');`,
            [search.toLowerCase()])
    }

    async cancelGuildRequest(sub: number): Promise<User> {
        let user = await this.findOne(sub)
        if (!user)
            throw new HttpException({
                message: [
                    'User does not exist'
                ]
            }, HttpStatus.BAD_REQUEST)
        user.guild_request = null
        return this.usersRepository.save(user)
    }

    async sendAuthMail (user: User, token: string) {
        this.mailjet
            .post("send", {'version': 'v3.1'})
            .request({
                "Messages":[{
                    "From": {
                        "Email": "noreply@fenyx-mc.fr",
                        "Name": "ft_transcendence"
                    },
                    "To": [{
                        "Email": user.email,
                        "Name": user.display_name
                    }],
                    "Subject": "Your 2fa code",
                    "TextPart": `Hi ${user.display_name}, there is your 2 factor authentication code: ${token}`,
                }]
            })
    }

    /**
     * Set the double auth token
     * @param id
     * @param token
     */
    async setDoubleAuthToken(id: number, token: string) : Promise<User> {
        let user = await this.findOne(id)
        user.double_auth_token = token
        await this.sendAuthMail(user, token)
        return this.usersRepository.save(user)
    }

    async removeDoubleAuthToken(id: number) {
        let user = await this.findOne(id)
        user.double_auth_token = ''
        return this.usersRepository.save(user)
    }
}
