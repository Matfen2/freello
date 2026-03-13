import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateProjectDto,
  UpdateProjectDto,
  PaginationQueryDto,
  CreateProjectWithTasksDto,
} from '@freello/api-types';

@ApiTags('projects')
@ApiBearerAuth()
@Controller({ path: 'projects', version: '1' })
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.projectService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Roles('admin')
  @Post('with-tasks')
  @HttpCode(HttpStatus.CREATED)
  createWithTasks(@Body() dto: CreateProjectWithTasksDto) {
    return this.projectService.createWithTasks(dto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}