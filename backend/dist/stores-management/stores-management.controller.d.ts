import { StoresManagementService } from './stores-management.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { CurrentUserData } from '../auth/decorators';
export declare class StoresManagementController {
    private readonly storesService;
    constructor(storesService: StoresManagementService);
    create(createStoreDto: CreateStoreDto, user: CurrentUserData): Promise<{
        chain: {
            id: number;
            name: string;
            code: string;
        };
    } & {
        status: import(".prisma/client").$Enums.StoreStatus;
        id: number;
        email: string | null;
        chainId: number;
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
    findAll(user: CurrentUserData, page?: string, pageSize?: string, search?: string, status?: string, chainId?: string): Promise<{
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
            status: import(".prisma/client").$Enums.StoreStatus;
            id: number;
            email: string | null;
            chainId: number;
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
            status: import(".prisma/client").$Enums.UserStatus;
            id: number;
            username: string;
            fullName: string;
        }[];
    } & {
        status: import(".prisma/client").$Enums.StoreStatus;
        id: number;
        email: string | null;
        chainId: number;
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
    update(id: number, updateStoreDto: UpdateStoreDto, user: CurrentUserData): Promise<{
        chain: {
            id: number;
            name: string;
            code: string;
        };
    } & {
        status: import(".prisma/client").$Enums.StoreStatus;
        id: number;
        email: string | null;
        chainId: number;
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
        status: import(".prisma/client").$Enums.StoreStatus;
        id: number;
        email: string | null;
        chainId: number;
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
}
