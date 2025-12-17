"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTenantService = void 0;
class BaseTenantService {
    getTenantFilter(user) {
        var _a;
        if ((_a = user.roles) === null || _a === void 0 ? void 0 : _a.some(r => r.code === 'super_admin')) {
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
        var _a;
        if ((_a = user.roles) === null || _a === void 0 ? void 0 : _a.some(r => r.code === 'super_admin')) {
            return {};
        }
        if (user.chainId) {
            return { chainId: user.chainId };
        }
        return {};
    }
    getStoreFilter(user) {
        var _a;
        if ((_a = user.roles) === null || _a === void 0 ? void 0 : _a.some(r => r.code === 'super_admin')) {
            return {};
        }
        if (user.storeId) {
            return { storeId: user.storeId };
        }
        return {};
    }
    canAccessChain(user, chainId) {
        var _a;
        if ((_a = user.roles) === null || _a === void 0 ? void 0 : _a.some(r => r.code === 'super_admin')) {
            return true;
        }
        return user.chainId === chainId;
    }
    canAccessStore(user, storeId) {
        var _a, _b;
        if ((_a = user.roles) === null || _a === void 0 ? void 0 : _a.some(r => r.code === 'super_admin')) {
            return true;
        }
        if ((_b = user.roles) === null || _b === void 0 ? void 0 : _b.some(r => r.level === 2)) {
            return true;
        }
        return user.storeId === storeId;
    }
}
exports.BaseTenantService = BaseTenantService;
//# sourceMappingURL=base-tenant.service.js.map