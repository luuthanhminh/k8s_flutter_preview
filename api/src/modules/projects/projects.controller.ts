import { Controller, Get, Post, Body, Param, HttpCode } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { DeployProjectDto } from './dto/deploy-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('generate')
  create() {
    return this.projectsService.create();
  }

  @Post('deploy')
  @HttpCode(200)
  deploy(@Body() deployProjectDto: DeployProjectDto) {
    return this.projectsService.deploy(deployProjectDto);
  }

  @Post('unDeploy')
  @HttpCode(200)
  unDeploy(@Body() deployProjectDto: DeployProjectDto) {
    return this.projectsService.unDeploy(deployProjectDto);
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
