import { IsString, IsOptional } from 'class-validator';

export class CreateModifierDto {
                    @IsString()
                    name: string;

                    @IsString()
                    options: string; // JSON string like: ["0%","30%","50%","70%","100%"]
}

export class UpdateModifierDto {
                    @IsString()
                    @IsOptional()
                    name?: string;

                    @IsString()
                    @IsOptional()
                    options?: string;
}
