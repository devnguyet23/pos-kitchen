"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTenantService = void 0;
class BaseTenantService {
    getTenantFilter(user) {
        if (user.roles?.some(r => r.code === 'super_admin')) {
            return {};
        }
        const filter = {};
        if (user.chainId) {
            filter.chainId = user.chainId;
        }
        if (user.storeId) {
            filter.storeId = user.storeId;
        }
        return filter;
    }
    getChainFilter(user) {
        if (user.roles?.some(r => r.code === 'super_admin')) {
            return {};
        }
        if (user.chainId) {
            return { chainId: user.chainId };
        }
        return {};
    }
    getStoreFilter(user) {
        if (user.roles?.some(r => r.code === 'super_admin')) {
            return {};
        }
        if (user.storeId) {
            return { storeId: user.storeId };
        }
        return {};
    }
    canAccessChain(user, chainId) {
        if (user.roles?.some(r => r.code === 'super_admin')) {
            return true;
        }
        return user.chainId === chainId;
    }
    canAccessStore(user, storeId) {
        if (user.roles?.some(r => r.code === 'super_admin')) {
            return true;
        }
        if (user.roles?.some(r => r.level === 2)) {
            return true;
        }
        return user.storeId === storeId;
    }
}
exports.BaseTenantService = BaseTenantService;
//# sourceMappingURL=base-tenant.service.js.map