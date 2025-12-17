import { PrismaService } from '../prisma/prisma.service';
import { CreateChainDto, UpdateChainDto } from './dto/chain.dto';
export declare class ChainsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createChainDto: CreateChainDto): Promise<{
        description: string | null;
        id: number;
        email: string | null;
        status: import(".prisma/client").$Enums.ChainStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        logoUrl: string | null;
        phone: string | null;
        website: string | null;
        address: string | null;
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
            description: string | null;
            id: number;
            email: string | null;
            status: import(".prisma/client").$Enums.ChainStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            logoUrl: string | null;
            phone: string | null;
            website: string | null;
            address: string | null;
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
            id: number;
            status: import(".prisma/client").$Enums.StoreStatus;
            name: string;
            code: string;
        }[];
    } & {
        description: string | null;
        id: number;
        email: string | null;
        status: import(".prisma/client").$Enums.ChainStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        logoUrl: string | null;
        phone: string | null;
        website: string | null;
        address: string | null;
        taxCode: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: number, updateChainDto: UpdateChainDto): Promise<{
        description: string | null;
        id: number;
        email: string | null;
        status: import(".prisma/client").$Enums.ChainStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        logoUrl: string | null;
        phone: string | null;
        website: string | null;
        address: string | null;
        taxCode: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    remove(id: number): Promise<{
        description: string | null;
        id: number;
        email: string | null;
        status: import(".prisma/client").$Enums.ChainStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        logoUrl: string | null;
        phone: string | null;
        website: string | null;
        address: string | null;
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
