import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateSpaceDto {
  @IsString()
  siteId: string;

  @IsString()
  name: string;

  @IsInt()
  @IsPositive()
  capacity: number;

  @IsOptional()
  @IsString()
  locationReference?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
