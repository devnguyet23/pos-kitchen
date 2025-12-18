import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateCategoryDto {
                    @IsString()
                    name: string;

                    @IsString()
                    @IsOptional()
                    description?: string;

                    @IsNumber()
                    @IsOptional()
                    parentId?: number;
}

export class UpdateCategoryDto {
                    @IsString()
                    @IsOptional()
                    name?: string;

                    @IsString()
                    @IsOptional()
                    description?: string;

                    @IsNumber()
                    @IsOptional()
                    parentId?: number;
}
