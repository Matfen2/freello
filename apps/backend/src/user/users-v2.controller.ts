import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationQueryDto } from '@freello/api-types';

@ApiTags('users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '2' })
export class UsersV2Controller {
  constructor(private readonly userService: UserService) {}

  @Roles('admin')
  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const result = await this.userService.findAll(query);
    // Breaking change : { data, meta } → { items, pagination }
    return {
      items: result.data,
      pagination: result.meta,
    };
  }
}