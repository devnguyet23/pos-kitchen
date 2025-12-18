import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { BaseTenantService } from '../common/base-tenant.service';
export declare class ProductsService extends BaseTenantService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProductDto: CreateProductDto, user?: CurrentUserData): Promise<{
        category: {
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            description: string | null;
            parentId: number | null;
        };
        modifiers: ({
            modifier: {
                id: number;
                chainId: number | null;
                name: string;
                options: string;
            };
        } & {
            modifierId: number;
            productId: number;
        })[];
    } & {
        status: number;
        id: number;
        chainId: number | null;
        createdAt: Date;
        name: string;
        price: number;
        image: string | null;
        categoryId: number;
    }>;
    private normalizeVietnamese;
    findAll(params?: {
        page?: number;
        limit?: number;
        search?: string;
        categoryId?: number;
        sortBy?: 'id' | 'name' | 'price';
        sortOrder?: 'asc' | 'desc';
    }, user?: CurrentUserData): Promise<{
        data: ({
            category: {
                id: number;
                chainId: number | null;
                createdAt: Date;
                name: string;
                description: string | null;
                parentId: number | null;
            };
            modifiers: ({
                modifier: {
                    id: number;
                    chainId: number | null;
                    name: string;
                    options: string;
                };
            } & {
                modifierId: number;
                productId: number;
            })[];
        } & {
            status: number;
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            price: number;
            image: string | null;
            categoryId: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        category: {
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            description: string | null;
            parentId: number | null;
        };
        modifiers: ({
            modifier: {
                id: number;
                chainId: number | null;
                name: string;
                options: string;
            };
        } & {
            modifierId: number;
            productId: number;
        })[];
    } & {
        status: number;
        id: number;
        chainId: number | null;
        createdAt: Date;
        name: string;
        price: number;
        image: string | null;
        categoryId: number;
    }>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<{
        category: {
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
            description: string | null;
            parentId: number | null;
        };
        modifiers: ({
            modifier: {
                id: number;
                chainId: number | null;
                name: string;
                options: string;
            };
        } & {
            modifierId: number;
            productId: number;
        })[];
    } & {
        status: number;
        id: number;
        chainId: number | null;
        createdAt: Date;
        name: string;
        price: number;
        image: string | null;
        categoryId: number;
    }>;
    remove(id: number): Promise<{
        status: number;
        id: number;
        chainId: number | null;
        createdAt: Date;
        name: string;
        price: number;
        image: string | null;
        categoryId: number;
    }>;
}
