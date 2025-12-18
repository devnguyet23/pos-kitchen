export declare enum StoreStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    MAINTENANCE = "MAINTENANCE"
}
export declare class CreateStoreDto {
    chainId: number;
    name: string;
    code: string;
    address?: string;
    ward?: string;
    district?: string;
    city?: string;
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    openingTime?: string;
    closingTime?: string;
    status?: StoreStatus;
}
export declare class UpdateStoreDto {
    name?: string;
    address?: string;
    ward?: string;
    district?: string;
    city?: string;
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    openingTime?: string;
    closingTime?: string;
    status?: StoreStatus;
}
