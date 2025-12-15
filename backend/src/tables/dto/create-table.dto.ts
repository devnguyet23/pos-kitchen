import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateTableDto {
  @IsString()
  name: string;

  @IsInt()
  @IsOptional()
  seats?: number;

  @IsInt()
  @IsOptional()
  x?: number;

  @IsInt()
  @IsOptional()
  y?: number;
}
