import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';

export class ProjectDto extends AbstractDto {
  @ApiPropertyOptional()
  projectName?: string;

  @ApiPropertyOptional()
  bucketName?: string;

  @ApiProperty()
  baseDomain: string;
}
