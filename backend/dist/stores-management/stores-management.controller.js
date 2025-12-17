"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoresManagementController = void 0;
const common_1 = require("@nestjs/common");
const stores_management_service_1 = require("./stores-management.service");
const store_dto_1 = require("./dto/store.dto");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../auth/decorators");
let StoresManagementController = class StoresManagementController {
    constructor(storesService) {
        this.storesService = storesService;
    }
    create(createStoreDto, user) {
        return this.storesService.create(createStoreDto, user);
    }
    findAll(user, page, pageSize, search, status, chainId) {
        const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
        const take = pageSize ? parseInt(pageSize) : 10;
        return this.storesService.findAll({ skip, take, search, status, chainId: chainId ? parseInt(chainId) : undefined }, user);
    }
    findOne(id, user) {
        return this.storesService.findOne(id, user);
    }
    getStats(id, user) {
        return this.storesService.getStats(id, user);
    }
    update(id, updateStoreDto, user) {
        return this.storesService.update(id, updateStoreDto, user);
    }
    remove(id, user) {
        return this.storesService.remove(id, user);
    }
};
exports.StoresManagementController = StoresManagementController;
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.RequirePermissions)('create_store'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [store_dto_1.CreateStoreDto, Object]),
    __metadata("design:returntype", void 0)
], StoresManagementController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.RequirePermissions)('view_stores', 'view_own_store'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('chainId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], StoresManagementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, decorators_1.RequirePermissions)('view_stores', 'view_own_store'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], StoresManagementController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, decorators_1.RequirePermissions)('view_stores', 'view_own_store'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], StoresManagementController.prototype, "getStats", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, decorators_1.RequirePermissions)('edit_store'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, store_dto_1.UpdateStoreDto, Object]),
    __metadata("design:returntype", void 0)
], StoresManagementController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, decorators_1.RequirePermissions)('delete_store'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], StoresManagementController.prototype, "remove", null);
exports.StoresManagementController = StoresManagementController = __decorate([
    (0, common_1.Controller)('stores-management'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [stores_management_service_1.StoresManagementService])
], StoresManagementController);
//# sourceMappingURL=stores-management.controller.js.map