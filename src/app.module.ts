import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from 'config/database.config';
import { BannedUser } from 'src/entities/banned-user.entity';
import { ChatRoom } from 'src/entities/chat-room.entity';
import { ChatRoomMember } from 'src/entities/chat-room-member.entity';
import { Friend } from 'src/entities/friend.entity';
import { Message } from 'src/entities/message.entity';
import { User } from './entities/user.entity';
import { Notification } from './entities/notification.entity';
import { AuthController } from './controllers/auth.controller';
import { UserService } from './services/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtSecret } from 'config/jwt.secret';
import { AuthMiddleware } from './auth/auth.middleware';
import { AuthService } from './auth/auth.service';
import { JwtService } from './auth/jwt.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { LocalStrategy } from './auth/local.strategy';
import { AuthGuard } from './auth/auth.guard';
import { ChatGateway } from './gateways/chat.gateway';
import { MessageService } from './services/message/message.service';
import { ChatRoomService } from './services/chatRoom/chat.room.service';
import { ChatRoomController } from './controllers/api/chat-room.controller';
import { MessageController } from './controllers/api/message.controller';
import { BannedUserService } from './services/bannedUser/banned-user.service';
import { FriendService } from './services/friend/friend.service';
import { FriendController } from './controllers/api/friend.controller';
import { UserController } from './controllers/api/user.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DatabaseConfig.host,
      port: 3306,
      username: DatabaseConfig.username,
      password: DatabaseConfig.password,
      database: DatabaseConfig.database,
      entities: [
        BannedUser,
        ChatRoom,
        ChatRoomMember,
        Friend,
        Message,
        Notification,
        User,
      ]
    }),
    TypeOrmModule.forFeature([
      BannedUser,
      ChatRoom,
      ChatRoomMember,
      Friend,
      Message,
      Notification,
      User,
    ]),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: {expiresIn: '1h'}
    })
  ],
  controllers: [
    AppController,
    AuthController,
    ChatRoomController,
    MessageController,
    FriendController,
    UserController,
  ],
  providers: [
    UserService,
    AuthService,
    JwtService,
    JwtStrategy,
    LocalStrategy,
    AuthGuard,
    ChatGateway,
    ChatRoomService,
    MessageService,
    BannedUserService,
    FriendService,
  ],
  exports: [
    AuthService,
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware)
            .exclude('auth/*')
            .forRoutes('api/*')
  }
}
