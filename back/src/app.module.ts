import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from './users/users.module';
import config from "../ormconfig";
import {GuildsModule} from "./guilds/guilds.module";
import { AuthModule } from './auth/auth.module';
import { ChatGateway } from './chat/chat.gateway';
import {ChatModule} from "./chat/chat.module";

@Module({
  imports: [
      TypeOrmModule.forRoot(config),
      UsersModule,
      GuildsModule,
      AuthModule,
      ChatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
