import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectDto } from './dto/project.dto';
import { K8sService } from '../../shared/services/k8s.service';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { generateShortId } from '../../shared/utils';
import { DeployProjectDto } from './dto/deploy-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private k8sService: K8sService,
    private apiConfigService: ApiConfigService,
  ) {}
  async create() {
    const projectDto = new ProjectDto();
    const id = generateShortId(projectDto.id, 8).toLowerCase();
    projectDto.domain = `${id}.${this.apiConfigService.baseDomain}`;
    projectDto.bucketName = `${this.apiConfigService.bucketName}/${id}`;
    return projectDto;
  }

  async deploy(deployProjectDto: DeployProjectDto) {
    const projectDto = new ProjectDto();
    projectDto.id = deployProjectDto.id;
    const id = generateShortId(deployProjectDto.id, 8).toLowerCase();
    projectDto.domain = `${id}.${this.apiConfigService.baseDomain}`;
    projectDto.bucketName = `${this.apiConfigService.bucketName}/${id}`;
    await this.k8sService.deployProject(projectDto);
  }

  async unDeploy(deployProjectDto: DeployProjectDto) {
    const projectDto = new ProjectDto();
    projectDto.id = deployProjectDto.id;
    const id = generateShortId(deployProjectDto.id, 8).toLowerCase();
    projectDto.domain = `${id}.${this.apiConfigService.baseDomain}`;
    projectDto.bucketName = `${this.apiConfigService.bucketName}/${id}`;

    await this.k8sService.unDeployProject(projectDto);
  }

  async getProjects(): Promise<ProjectDto[]> {
    const items = await this.k8sService.getDeployments();
    return items.map((item) => {
      const projectDto = new ProjectDto();
      projectDto.id = item.id;
      const id = generateShortId(item.id, 8).toLowerCase();
      projectDto.domain = `${id}.${this.apiConfigService.baseDomain}`;
      projectDto.bucketName = `${this.apiConfigService.bucketName}/${id}`;
      return projectDto;
    });
  }

  async getProject(projectId: string): Promise<ProjectDto> {
    const items = await this.k8sService.getDeployments();
    const item = items.find((item) => item.id === projectId);
    if (!item) {
      throw new NotFoundException();
    }
    const projectDto = new ProjectDto();
    projectDto.id = item.id;
    const id = generateShortId(item.id, 8).toLowerCase();
    projectDto.domain = `${id}.${this.apiConfigService.baseDomain}`;
    projectDto.bucketName = `${this.apiConfigService.bucketName}/${id}`;
    return projectDto;
  }
}
