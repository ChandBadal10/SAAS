import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({
    example: false,
    description:
      'Set to false to deactivate the account or true to activate the account.',
  })
  @IsBoolean()
  isActive!: boolean;
}