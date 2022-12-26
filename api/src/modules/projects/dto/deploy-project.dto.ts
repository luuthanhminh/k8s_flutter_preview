import { ApiProperty } from '@nestjs/swagger';

export class DeployProjectDto {
  @ApiProperty()
  id: string;
}
