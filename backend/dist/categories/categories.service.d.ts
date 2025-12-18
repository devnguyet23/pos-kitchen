import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { BaseTenantService } from '../common/base-tenant.service';
import { CacheService } from '../cache/cache.service';
export declare class CategoriesService extends BaseTenantService {
    private prisma;
    private cacheService;
    constructor(prisma: PrismaService, cacheService: CacheService);
    private getHierarchyDepth;
    create(createCategoryDto: CreateCategoryDto, user?: CurrentUserData): Promise<{
        _count: {
            products: number;
        };
        parent: {
            description: string | null;
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            parentId: number | null;
        };
        children: {
            description: string | null;
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            parentId: number | null;
        }[];
    } & {
        description: string | null;
        id: number;
        chainId: number | null;
        createdAt: Date;
        name: string;
        parentId: number | null;
    }>;
    findAll(user?: CurrentUserData): Promise<({
        _count: {
            products: number;
        };
        parent: {
            description: string | null;
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            parentId: number | null;
        };
        children: ({
            _count: {
                products: number;
            };
            children: {
                description: string | null;
                id: number;
                chainId: number | null;
                createdAt: Date;
                name: string;
                parentId: number | null;
            }[];
        } & {
            description: string | null;
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            parentId: number | null;
        })[];
    } & {
        description: string | null;
        id: number;
        chainId: number | null;
        createdAt: Date;
        name: string;
        parentId: number | null;
    })[]>;
    findOne(id: number): Promise<{
        products: {
            status: number;
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            price: number;
            image: string | null;
            categoryId: number;
        }[];
        _count: {
            products: number;
        };
        parent: {
            description: string | null;
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            parentId: number | null;
        };
        children: ({
            _count: {
                products: number;
            };
            children: {
                description: string | null;
                id: number;
                chainId: number | null;
                createdAt: Date;
                name: string;
                parentId: number | null;
            }[];
        } & {
            description: string | null;
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            parentId: number | null;
        })[];
    } & {
        description: string | null;
        id: number;
        chainId: number | null;
        createdAt: Date;
        name: string;
        parentId: number | null;
    }>;
    update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<{
        _count: {
            products: number;
        };
        parent: {
            description: string | null;
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            parentId: number | null;
        };
        children: {
            description: string | null;
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            parentId: number | null;
        }[];
    } & {
        description: string | null;
        id: number;
        chainId: number | null;
        createdAt: Date;
        name: string;
        parentId: number | null;
    }>;
    remove(id: number): Promise<{
        description: string | null;
        id: number;
        chainId: number | null;
        createdAt: Date;
        name: string;
        parentId: number | null;
    }>;
}
