import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, user: CurrentUserData): Promise<{
        category: {
            description: string | null;
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
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
            productId: number;
            modifierId: number;
        })[];
    } & {
        id: number;
        chainId: number | null;
        status: number;
        createdAt: Date;
        name: string;
        price: number;
        image: string | null;
        categoryId: number;
    }>;
    findAll(page?: string, limit?: string, search?: string, categoryId?: string, sortBy?: 'id' | 'name' | 'price', sortOrder?: 'asc' | 'desc', user?: CurrentUserData): Promise<{
        data: ({
            category: {
                description: string | null;
                id: number;
                chainId: number | null;
                createdAt: Date;
                name: string;
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
                productId: number;
                modifierId: number;
            })[];
        } & {
            id: number;
            chainId: number | null;
            status: number;
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
            description: string | null;
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
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
            productId: number;
            modifierId: number;
        })[];
    } & {
        id: number;
        chainId: number | null;
        status: number;
        createdAt: Date;
        name: string;
        price: number;
        image: string | null;
        categoryId: number;
    }>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<{
        category: {
            description: string | null;
            id: number;
            chainId: number | null;
            createdAt: Date;
            name: string;
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
            productId: number;
            modifierId: number;
        })[];
    } & {
        id: number;
        chainId: number | null;
        status: number;
        createdAt: Date;
        name: string;
        price: number;
        image: string | null;
        categoryId: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        chainId: number | null;
        status: number;
        createdAt: Date;
        name: string;
        price: number;
        image: string | null;
        categoryId: number;
    }>;
}
