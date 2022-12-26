import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { DeployProjectDto } from './dto/deploy-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Post('deploy')
  deploy(@Body() deployProjectDto: DeployProjectDto) {
    return this.projectsService.deploy(deployProjectDto);
  }

  @Get()
  findAll() {
    return this.projectsService.getProjects();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.getProject(id);
  }
}
