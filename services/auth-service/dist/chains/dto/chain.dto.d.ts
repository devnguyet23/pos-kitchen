export declare enum ChainStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}
export declare class CreateChainDto {
    name: string;
    code: string;
    description?: string;
    logoUrl?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    taxCode?: string;
    status?: ChainStatus;
}
export declare class UpdateChainDto {
    name?: string;
    description?: string;
    logoUrl?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    taxCode?: string;
    status?: ChainStatus;
}
