"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopeGuard = void 0;
const common_1 = require("@nestjs/common");
let ScopeGuard = class ScopeGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            return true;
        }
        const isSuperAdmin = user.roles.some(r => r.code === 'super_admin');
        if (isSuperAdmin) {
            return true;
        }
        const requestedChainId = this.getRequestedChainId(request);
        const requestedStoreId = this.getRequestedStoreId(request);
        if (!requestedChainId && !requestedStoreId) {
            return true;
        }
        if (requestedChainId) {
            const hasChainAccess = user.roles.some(r => r.level === 1 ||
                (r.level === 2 && r.chainId === requestedChainId) ||
                (r.level === 3 && r.chainId === requestedChainId)) || user.chainId === requestedChainId;
            if (!hasChainAccess) {
                throw new common_1.ForbiddenException('Bạn không có quyền truy cập chuỗi này');
            }
        }
        if (requestedStoreId) {
            const hasStoreAccess = user.roles.some(r => r.level === 1 ||
                r.level === 2 ||
                (r.level === 3 && r.storeId === requestedStoreId)) || user.storeId === requestedStoreId;
            if (!hasStoreAccess) {
                throw new common_1.ForbiddenException('Bạn không có quyền truy cập cửa hàng này');
            }
        }
        return true;
    }
    getRequestedChainId(request) {
        const chainId = request.query?.chainId || request.params?.chainId || request.body?.chainId;
        return chainId ? parseInt(chainId, 10) : null;
    }
    getRequestedStoreId(request) {
        const storeId = request.query?.storeId || request.params?.storeId || request.body?.storeId;
        return storeId ? parseInt(storeId, 10) : null;
    }
};
exports.ScopeGuard = ScopeGuard;
exports.ScopeGuard = ScopeGuard = __decorate([
    (0, common_1.Injectable)()
], ScopeGuard);
//# sourceMappingURL=scope.guard.js.map