import { IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
                    @IsString()
                    name: string;
}

export class UpdateCategoryDto {
                    @IsString()
                    @IsOptional()
                    name?: string;
}
