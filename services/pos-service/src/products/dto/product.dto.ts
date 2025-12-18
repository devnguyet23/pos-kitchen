import { IsString, IsNumber, IsOptional, IsInt, IsArray } from 'class-validator';

export class CreateProductDto {
                    @IsString()
                    name: string;

                    @IsNumber()
                    price: number;

                    @IsString()
                    @IsOptional()
                    image?: string;

                    @IsInt()
                    categoryId: number;

                    @IsInt()
                    @IsOptional()
                    status?: number; // 0: hidden, 1: visible

                    @IsArray()
                    @IsOptional()
                    modifierIds?: number[];
}

export class UpdateProductDto {
                    @IsString()
                    @IsOptional()
                    name?: string;

                    @IsNumber()
                    @IsOptional()
                    price?: number;

                    @IsString()
                    @IsOptional()
                    image?: string;

                    @IsInt()
                    @IsOptional()
                    categoryId?: number;

                    @IsInt()
                    @IsOptional()
                    status?: number; // 0: hidden, 1: visible

                    @IsArray()
                    @IsOptional()
                    modifierIds?: number[];
}

