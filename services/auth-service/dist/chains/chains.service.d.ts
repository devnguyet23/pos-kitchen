import { PrismaService } from '../prisma/prisma.service';
import { CreateChainDto, UpdateChainDto } from './dto/chain.dto';
export declare class ChainsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createChainDto: CreateChainDto): Promise<{
        status: import(".prisma/client").$Enums.ChainStatus;
        email: string | null;
        phone: string | null;
        id: number;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        logoUrl: string | null;
        website: string | null;
        taxCode: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(params: {
        skip?: number;
        take?: number;
        search?: string;
        status?: string;
    }): Promise<{
        data: ({
            _count: {
                stores: number;
                users: number;
            };
        } & {
            status: import(".prisma/client").$Enums.ChainStatus;
            email: string | null;
            phone: string | null;
            id: number;
            address: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            description: string | null;
            logoUrl: string | null;
            website: string | null;
            taxCode: string | null;
            settings: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
        _count: {
            stores: number;
            users: number;
        };
        stores: {
            status: import(".prisma/client").$Enums.StoreStatus;
            id: number;
            name: string;
            code: string;
        }[];
    } & {
        status: import(".prisma/client").$Enums.ChainStatus;
        email: string | null;
        phone: string | null;
        id: number;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        logoUrl: string | null;
        website: string | null;
        taxCode: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: number, updateChainDto: UpdateChainDto): Promise<{
        status: import(".prisma/client").$Enums.ChainStatus;
        email: string | null;
        phone: string | null;
        id: number;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        logoUrl: string | null;
        website: string | null;
        taxCode: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    remove(id: number): Promise<{
        status: import(".prisma/client").$Enums.ChainStatus;
        email: string | null;
        phone: string | null;
        id: number;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        description: string | null;
        logoUrl: string | null;
        website: string | null;
        taxCode: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getStats(id: number): Promise<{
        storeCount: number;
        userCount: number;
        activeStores: number;
        inactiveStores: number;
    }>;
}
