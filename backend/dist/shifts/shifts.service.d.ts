import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { Decimal } from '@prisma/client/runtime/library';
export declare class ShiftsService {
    private prisma;
    constructor(prisma: PrismaService);
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
        status: import(".prisma/client").$Enums.ShiftStatus;
        id: number;
        storeId: number;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        shiftCode: string;
        openedAt: Date;
        closedAt: Date | null;
        openingCash: Decimal;
        closingCash: Decimal | null;
        expectedCash: Decimal | null;
        cashDifference: Decimal | null;
        totalSales: Decimal;
        totalOrders: number;
        totalRefunds: Decimal;
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
        status: import(".prisma/client").$Enums.ShiftStatus;
        id: number;
        storeId: number;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        shiftCode: string;
        openedAt: Date;
        closedAt: Date | null;
        openingCash: Decimal;
        closingCash: Decimal | null;
        expectedCash: Decimal | null;
        cashDifference: Decimal | null;
        totalSales: Decimal;
        totalOrders: number;
        totalRefunds: Decimal;
        note: string | null;
        closedBy: number | null;
    }>;
    findAll(params: {
        skip?: number;
        take?: number;
        storeId?: number;
        status?: string;
        userId?: number;
    }, user: CurrentUserData): Promise<{
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
            status: import(".prisma/client").$Enums.ShiftStatus;
            id: number;
            storeId: number;
            userId: number;
            createdAt: Date;
            updatedAt: Date;
            shiftCode: string;
            openedAt: Date;
            closedAt: Date | null;
            openingCash: Decimal;
            closingCash: Decimal | null;
            expectedCash: Decimal | null;
            cashDifference: Decimal | null;
            totalSales: Decimal;
            totalOrders: number;
            totalRefunds: Decimal;
            note: string | null;
            closedBy: number | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
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
        status: import(".prisma/client").$Enums.ShiftStatus;
        id: number;
        storeId: number;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        shiftCode: string;
        openedAt: Date;
        closedAt: Date | null;
        openingCash: Decimal;
        closingCash: Decimal | null;
        expectedCash: Decimal | null;
        cashDifference: Decimal | null;
        totalSales: Decimal;
        totalOrders: number;
        totalRefunds: Decimal;
        note: string | null;
        closedBy: number | null;
    }>;
    getCurrentShift(user: CurrentUserData): Promise<{
        store: {
            id: number;
            name: string;
            code: string;
        };
    } & {
        status: import(".prisma/client").$Enums.ShiftStatus;
        id: number;
        storeId: number;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
        shiftCode: string;
        openedAt: Date;
        closedAt: Date | null;
        openingCash: Decimal;
        closingCash: Decimal | null;
        expectedCash: Decimal | null;
        cashDifference: Decimal | null;
        totalSales: Decimal;
        totalOrders: number;
        totalRefunds: Decimal;
        note: string | null;
        closedBy: number | null;
    }>;
    getMyShifts(user: CurrentUserData, params: {
        skip?: number;
        take?: number;
    }): Promise<{
        data: ({
            store: {
                id: number;
                name: string;
                code: string;
            };
        } & {
            status: import(".prisma/client").$Enums.ShiftStatus;
            id: number;
            storeId: number;
            userId: number;
            createdAt: Date;
            updatedAt: Date;
            shiftCode: string;
            openedAt: Date;
            closedAt: Date | null;
            openingCash: Decimal;
            closingCash: Decimal | null;
            expectedCash: Decimal | null;
            cashDifference: Decimal | null;
            totalSales: Decimal;
            totalOrders: number;
            totalRefunds: Decimal;
            note: string | null;
            closedBy: number | null;
        })[];
        total: number;
    }>;
    private isSuperAdmin;
    private canCloseOtherShift;
    private hasShiftAccess;
}
