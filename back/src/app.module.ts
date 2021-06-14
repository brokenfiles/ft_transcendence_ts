import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from './users/users.module';
import config from "../ormconfig";
import {GuildsModule} from "./guilds/guilds.module";
import { AuthModule } from './auth/auth.module';
import {WebsocketModule} from "./gateways/websocket/websocket.module";
import {AchievementsModule} from "./achievement/achievements.module";
import {FriendsModule} from "./friends/friends.module";
import {ChatsModule} from "./chat/chats.module";
import {MulterModule} from "@nestjs/platform-express";
import {CdnModule} from "./cdn/cdn.module";

@Module({
  imports: [
      TypeOrmModule.forRoot(config),
      MulterModule.register({
          dest: '../uploads',
      }),
      UsersModule,
      GuildsModule,
      AuthModule,
      WebsocketModule,
      AchievementsModule,
      FriendsModule,
      ChatsModule,
      CdnModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
