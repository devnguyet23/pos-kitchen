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
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            description: string | null;
            parentId: number | null;
        };
        children: {
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            description: string | null;
            parentId: number | null;
        }[];
    } & {
        id: number;
        chainId: number | null;
        createdAt: Date;
        name: string;
        description: string | null;
        parentId: number | null;
    }>;
    findAll(user: CurrentUserData): Promise<({
        _count: {
            products: number;
        };
        parent: {
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            description: string | null;
            parentId: number | null;
        };
        children: ({
            _count: {
                products: number;
            };
            children: {
                id: number;
                chainId: number | null;
                createdAt: Date;
                name: string;
                description: string | null;
                parentId: number | null;
            }[];
        } & {
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            description: string | null;
            parentId: number | null;
        })[];
    } & {
        id: number;
        chainId: number | null;
        createdAt: Date;
        name: string;
        description: string | null;
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
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            description: string | null;
            parentId: number | null;
        };
        children: ({
            _count: {
                products: number;
            };
            children: {
                id: number;
                chainId: number | null;
                createdAt: Date;
                name: string;
                description: string | null;
                parentId: number | null;
            }[];
        } & {
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            description: string | null;
            parentId: number | null;
        })[];
    } & {
        id: number;
        chainId: number | null;
        createdAt: Date;
        name: string;
        description: string | null;
        parentId: number | null;
    }>;
    update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<{
        _count: {
            products: number;
        };
        parent: {
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            description: string | null;
            parentId: number | null;
        };
        children: {
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            description: string | null;
            parentId: number | null;
        }[];
    } & {
        id: number;
        chainId: number | null;
        createdAt: Date;
        name: string;
        description: string | null;
        parentId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        chainId: number | null;
        createdAt: Date;
        name: string;
        description: string | null;
        parentId: number | null;
    }>;
}
