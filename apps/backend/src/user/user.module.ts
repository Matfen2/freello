import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UsersV2Controller } from './users-v2.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController, UsersV2Controller],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}