import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity';
import { UseDto } from '../../decorators';
import { ProjectDto } from './dtos/project.dto';

@Entity({ name: 'projects' })
@UseDto(ProjectDto)
export class ProjectEntity extends AbstractEntity<ProjectDto> {
  @Column({ nullable: true })
  projectName?: string;

  @Column({ nullable: true })
  bucketName?: string;

  @Column({ nullable: true })
  baseDomain?: string;
}
