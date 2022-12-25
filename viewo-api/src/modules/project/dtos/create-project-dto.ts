import { IsNotEmpty, IsString } from 'class-validator';

import { Trim } from '../../../decorators';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @Trim()
  readonly projectName: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  readonly bucketName: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  readonly baseDomain: string;
}
