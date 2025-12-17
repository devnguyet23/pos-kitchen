import { ShiftsService } from './shifts.service';
import { CurrentUserData } from '../auth/decorators';
export declare class ShiftsController {
    private readonly shiftsService;
    constructor(shiftsService: ShiftsService);
    openShift(data: {
        openingCash: number;
    }, user: CurrentUserData): Promise<{
        store: {
            id: number;
            name: string;
            code: string;
        };
        user: {
            id: number;
            username: string;
            fullName: string;
        };
    } & {
        id: number;
        storeId: number;
        status: import(".prisma/client").$Enums.ShiftStatus;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        shiftCode: string;
        openedAt: Date;
        closedAt: Date | null;
        openingCash: import("@prisma/client/runtime/library").Decimal;
        closingCash: import("@prisma/client/runtime/library").Decimal | null;
        expectedCash: import("@prisma/client/runtime/library").Decimal | null;
        cashDifference: import("@prisma/client/runtime/library").Decimal | null;
        totalSales: import("@prisma/client/runtime/library").Decimal;
        totalOrders: number;
        totalRefunds: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        closedBy: number | null;
    }>;
    closeShift(id: number, data: {
        closingCash: number;
        note?: string;
    }, user: CurrentUserData): Promise<{
        store: {
            id: number;
            name: string;
            code: string;
        };
        user: {
            id: number;
            username: string;
            fullName: string;
        };
    } & {
        id: number;
        storeId: number;
        status: import(".prisma/client").$Enums.ShiftStatus;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        shiftCode: string;
        openedAt: Date;
        closedAt: Date | null;
        openingCash: import("@prisma/client/runtime/library").Decimal;
        closingCash: import("@prisma/client/runtime/library").Decimal | null;
        expectedCash: import("@prisma/client/runtime/library").Decimal | null;
        cashDifference: import("@prisma/client/runtime/library").Decimal | null;
        totalSales: import("@prisma/client/runtime/library").Decimal;
        totalOrders: number;
        totalRefunds: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        closedBy: number | null;
    }>;
    findAll(user: CurrentUserData, page?: string, pageSize?: string, storeId?: string, status?: string, userId?: string): Promise<{
        data: ({
            store: {
                id: number;
                name: string;
                code: string;
            };
            user: {
                id: number;
                username: string;
                fullName: string;
            };
            closedByUser: {
                id: number;
                username: string;
                fullName: string;
            };
        } & {
            id: number;
            storeId: number;
            status: import(".prisma/client").$Enums.ShiftStatus;
            userId: number;
            createdAt: Date;
            updatedAt: Date;
            shiftCode: string;
            openedAt: Date;
            closedAt: Date | null;
            openingCash: import("@prisma/client/runtime/library").Decimal;
            closingCash: import("@prisma/client/runtime/library").Decimal | null;
            expectedCash: import("@prisma/client/runtime/library").Decimal | null;
            cashDifference: import("@prisma/client/runtime/library").Decimal | null;
            totalSales: import("@prisma/client/runtime/library").Decimal;
            totalOrders: number;
            totalRefunds: import("@prisma/client/runtime/library").Decimal;
            note: string | null;
            closedBy: number | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getCurrentShift(user: CurrentUserData): Promise<{
        store: {
            id: number;
            name: string;
            code: string;
        };
    } & {
        id: number;
        storeId: number;
        status: import(".prisma/client").$Enums.ShiftStatus;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        shiftCode: string;
        openedAt: Date;
        closedAt: Date | null;
        openingCash: import("@prisma/client/runtime/library").Decimal;
        closingCash: import("@prisma/client/runtime/library").Decimal | null;
        expectedCash: import("@prisma/client/runtime/library").Decimal | null;
        cashDifference: import("@prisma/client/runtime/library").Decimal | null;
        totalSales: import("@prisma/client/runtime/library").Decimal;
        totalOrders: number;
        totalRefunds: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        closedBy: number | null;
    }>;
    getMyShifts(user: CurrentUserData, page?: string, pageSize?: string): Promise<{
        data: ({
            store: {
                id: number;
                name: string;
                code: string;
            };
        } & {
            id: number;
            storeId: number;
            status: import(".prisma/client").$Enums.ShiftStatus;
            userId: number;
            createdAt: Date;
            updatedAt: Date;
            shiftCode: string;
            openedAt: Date;
            closedAt: Date | null;
            openingCash: import("@prisma/client/runtime/library").Decimal;
            closingCash: import("@prisma/client/runtime/library").Decimal | null;
            expectedCash: import("@prisma/client/runtime/library").Decimal | null;
            cashDifference: import("@prisma/client/runtime/library").Decimal | null;
            totalSales: import("@prisma/client/runtime/library").Decimal;
            totalOrders: number;
            totalRefunds: import("@prisma/client/runtime/library").Decimal;
            note: string | null;
            closedBy: number | null;
        })[];
        total: number;
    }>;
    findOne(id: number, user: CurrentUserData): Promise<{
        store: {
            id: number;
            chainId: number;
            name: string;
            code: string;
        };
        user: {
            id: number;
            username: string;
            fullName: string;
        };
        closedByUser: {
            id: number;
            username: string;
            fullName: string;
        };
    } & {
        id: number;
        storeId: number;
        status: import(".prisma/client").$Enums.ShiftStatus;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        shiftCode: string;
        openedAt: Date;
        closedAt: Date | null;
        openingCash: import("@prisma/client/runtime/library").Decimal;
        closingCash: import("@prisma/client/runtime/library").Decimal | null;
        expectedCash: import("@prisma/client/runtime/library").Decimal | null;
        cashDifference: import("@prisma/client/runtime/library").Decimal | null;
        totalSales: import("@prisma/client/runtime/library").Decimal;
        totalOrders: number;
        totalRefunds: import("@prisma/client/runtime/library").Decimal;
        note: string | null;
        closedBy: number | null;
    }>;
}
