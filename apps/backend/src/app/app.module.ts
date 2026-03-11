import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../user/user.module';
import { ProjectModule } from '../project/project.module';
import { TaskModule } from '../task/task.module';
import { AssignmentModule } from '../assignment/assignment.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '../../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'freello'),
        password: configService.get<string>('DB_PASSWORD', 'freello'),
        database: configService.get<string>('DB_DATABASE', 'freello'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: Number(config.get('RATE_LIMIT_TTL', 60)),
            limit: Number(config.get('RATE_LIMIT_LIMIT', 100)),
          },
        ],
      }),
      inject: [ConfigService],
    }),
    UserModule,
    ProjectModule,
    TaskModule,
    AssignmentModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}