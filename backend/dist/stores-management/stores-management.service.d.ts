import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
export declare class StoresManagementService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createStoreDto: CreateStoreDto, user: CurrentUserData): Promise<{
        chain: {
            id: number;
            name: string;
            code: string;
        };
    } & {
        id: number;
        email: string | null;
        chainId: number;
        status: import(".prisma/client").$Enums.StoreStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        phone: string | null;
        address: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        ward: string | null;
        district: string | null;
        city: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        openingTime: string | null;
        closingTime: string | null;
    }>;
    findAll(params: {
        skip?: number;
        take?: number;
        search?: string;
        status?: string;
        chainId?: number;
    }, user: CurrentUserData): Promise<{
        data: ({
            chain: {
                id: number;
                name: string;
                code: string;
            };
            _count: {
                users: number;
                shifts: number;
            };
        } & {
            id: number;
            email: string | null;
            chainId: number;
            status: import(".prisma/client").$Enums.StoreStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            phone: string | null;
            address: string | null;
            settings: import("@prisma/client/runtime/library").JsonValue | null;
            ward: string | null;
            district: string | null;
            city: string | null;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            openingTime: string | null;
            closingTime: string | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: number, user: CurrentUserData): Promise<{
        chain: {
            id: number;
            name: string;
            code: string;
        };
        _count: {
            users: number;
            shifts: number;
        };
        users: {
            id: number;
            username: string;
            status: import(".prisma/client").$Enums.UserStatus;
            fullName: string;
        }[];
    } & {
        id: number;
        email: string | null;
        chainId: number;
        status: import(".prisma/client").$Enums.StoreStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        phone: string | null;
        address: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        ward: string | null;
        district: string | null;
        city: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        openingTime: string | null;
        closingTime: string | null;
    }>;
    update(id: number, updateStoreDto: UpdateStoreDto, user: CurrentUserData): Promise<{
        chain: {
            id: number;
            name: string;
            code: string;
        };
    } & {
        id: number;
        email: string | null;
        chainId: number;
        status: import(".prisma/client").$Enums.StoreStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        phone: string | null;
        address: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        ward: string | null;
        district: string | null;
        city: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        openingTime: string | null;
        closingTime: string | null;
    }>;
    remove(id: number, user: CurrentUserData): Promise<{
        id: number;
        email: string | null;
        chainId: number;
        status: import(".prisma/client").$Enums.StoreStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        phone: string | null;
        address: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue | null;
        ward: string | null;
        district: string | null;
        city: string | null;
        latitude: import("@prisma/client/runtime/library").Decimal | null;
        longitude: import("@prisma/client/runtime/library").Decimal | null;
        openingTime: string | null;
        closingTime: string | null;
    }>;
    getStats(id: number, user: CurrentUserData): Promise<{
        userCount: number;
        activeUsers: number;
        shiftCount: number;
        openShifts: number;
    }>;
    private isSuperAdmin;
    private hasChainAccess;
    private hasStoreAccess;
}
