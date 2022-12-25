import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '../../../common/dtos/base.dto';

export class ProjectDto extends BaseDto {
  @ApiProperty()
  projectName: string;

  @ApiProperty()
  bucketName: string;

  @ApiProperty()
  baseDomain: string;
}
