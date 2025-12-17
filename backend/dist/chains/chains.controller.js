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
exports.ChainsController = void 0;
const common_1 = require("@nestjs/common");
const chains_service_1 = require("./chains.service");
const chain_dto_1 = require("./dto/chain.dto");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../auth/decorators");
let ChainsController = class ChainsController {
    constructor(chainsService) {
        this.chainsService = chainsService;
    }
    create(createChainDto) {
        return this.chainsService.create(createChainDto);
    }
    findAll(page, pageSize, search, status) {
        const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
        const take = pageSize ? parseInt(pageSize) : 10;
        return this.chainsService.findAll({ skip, take, search, status });
    }
    findOne(id) {
        return this.chainsService.findOne(id);
    }
    getStats(id) {
        return this.chainsService.getStats(id);
    }
    update(id, updateChainDto) {
        return this.chainsService.update(id, updateChainDto);
    }
    remove(id) {
        return this.chainsService.remove(id);
    }
};
exports.ChainsController = ChainsController;
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.RequireRoles)('super_admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chain_dto_1.CreateChainDto]),
    __metadata("design:returntype", void 0)
], ChainsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.RequirePermissions)('view_chains'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ChainsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, decorators_1.RequirePermissions)('view_chains', 'view_own_chain'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChainsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, decorators_1.RequirePermissions)('view_chains', 'view_own_chain'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChainsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, decorators_1.RequirePermissions)('edit_chain'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, chain_dto_1.UpdateChainDto]),
    __metadata("design:returntype", void 0)
], ChainsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, decorators_1.RequireRoles)('super_admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChainsController.prototype, "remove", null);
exports.ChainsController = ChainsController = __decorate([
    (0, common_1.Controller)('chains'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chains_service_1.ChainsService])
], ChainsController);
//# sourceMappingURL=chains.controller.js.map