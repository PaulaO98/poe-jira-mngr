import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @Matches(/^[A-Z0-9-]{2,10}$/)
  key: string;

  @IsOptional()
  @IsString()
  description?: string;
}


