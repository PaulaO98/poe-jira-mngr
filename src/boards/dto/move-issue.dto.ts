import { IsInt, IsOptional } from 'class-validator';

export class MoveIssueDto {
  @IsInt()
  toColumnId: number;

  @IsOptional()
  @IsInt()
  beforeIssueId?: number;

  @IsOptional()
  @IsInt()
  afterIssueId?: number;
}
