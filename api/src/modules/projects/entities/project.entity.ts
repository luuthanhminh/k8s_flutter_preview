import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { ProjectDto } from '../dto/project.dto';

@Entity({ name: 'projects' })
export class ProjectEntity extends BaseEntity<ProjectDto> {
  @Column()
  projectName: string;

  @Column()
  bucketName: string;

  @Column()
  baseDomain: string;

  toDto(): ProjectDto {
    const dto = new ProjectDto();
    dto.id = this.id;
    dto.projectName = this.projectName;
    dto.bucketName = this.bucketName;
    dto.baseDomain = this.baseDomain;
    return dto;
  }
  constructor(dto?: ProjectDto) {
    super(dto);
    if (dto) {
      this.projectName = dto.projectName;
      this.bucketName = dto.bucketName;
      this.baseDomain = dto.baseDomain;
    }
  }
}
