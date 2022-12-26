import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectDto } from './dto/project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectEntity } from './entities/project.entity';
import { K8sService } from '../../shared/services/k8s.service';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { generateShortId } from '../../shared/utils';
import { DeployProjectDto } from './dto/deploy-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private projectRepository: Repository<ProjectEntity>,
    private k8sService: K8sService,
    private apiConfigService: ApiConfigService,
  ) {}
  async create(createProjectDto: CreateProjectDto) {
    const projectDto = new ProjectDto();
    const id = generateShortId(projectDto.id, 8);
    projectDto.projectName = createProjectDto.projectName;
    projectDto.domain = `${id}.${this.apiConfigService.baseDomain}`;
    projectDto.bucketName = `${this.apiConfigService.bucketName}/${id}`;
    const project = this.projectRepository.create(projectDto);
    project.isDeployed = false;

    await this.projectRepository.save(project);
    return project.toDto();
  }

  async deploy(deployProjectDto: DeployProjectDto) {
    const project = await this.getEntity(deployProjectDto.id);

    await this.k8sService.deployProject(project.toDto());

    project.isDeployed = true;

    await this.projectRepository.save(project);
  }

  async getProjects(): Promise<ProjectDto[]> {
    const queryBuilder = this.projectRepository.createQueryBuilder('project');
    const items = await queryBuilder.getMany();
    return items.map((item) => item.toDto());
  }

  async getProject(projectId: string): Promise<ProjectDto> {
    const projectEntity = await this.getEntity(projectId);
    return projectEntity.toDto();
  }

  async getEntity(projectId: string): Promise<ProjectEntity> {
    const queryBuilder = this.projectRepository
      .createQueryBuilder('projects')
      .where('projects.id = :projectId', { projectId });

    const projectEntity = await queryBuilder.getOne();

    if (!projectEntity) {
      throw new NotFoundException();
    }
    return projectEntity;
  }
}
