import { ModifiersService } from './modifiers.service';
import { CreateModifierDto, UpdateModifierDto } from './dto/modifier.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
export declare class ModifiersController {
    private readonly modifiersService;
    constructor(modifiersService: ModifiersService);
    create(createModifierDto: CreateModifierDto, user: CurrentUserData): Promise<{
        id: number;
        chainId: number | null;
        name: string;
        options: string;
    }>;
    findAll(user: CurrentUserData): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        chainId: number | null;
        name: string;
        options: string;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        chainId: number | null;
        name: string;
        options: string;
    }>;
    update(id: number, updateModifierDto: UpdateModifierDto): Promise<{
        id: number;
        chainId: number | null;
        name: string;
        options: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        chainId: number | null;
        name: string;
        options: string;
    }>;
}
