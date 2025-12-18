import { CurrentUserData } from '../auth/decorators/current-user.decorator';
export declare abstract class BaseTenantService {
    protected getTenantFilter(user: CurrentUserData): {
        chainId?: number;
        storeId?: number;
    };
    protected getChainFilter(user: CurrentUserData): {
        chainId?: number;
    };
    protected getStoreFilter(user: CurrentUserData): {
        storeId?: number;
    };
    protected canAccessChain(user: CurrentUserData, chainId: number): boolean;
    protected canAccessStore(user: CurrentUserData, storeId: number): boolean;
}
