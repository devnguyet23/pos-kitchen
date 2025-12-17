import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto, user: CurrentUserData): Promise<{
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
    findAll(user: CurrentUserData): import(".prisma/client").Prisma.PrismaPromise<({
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
        _count: {
            products: number;
        };
        products: {
            id: number;
            chainId: number | null;
            status: number;
            createdAt: Date;
            name: string;
            price: number;
            image: string | null;
            categoryId: number;
        }[];
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
