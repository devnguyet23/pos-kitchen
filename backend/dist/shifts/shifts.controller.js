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
exports.ShiftsController = void 0;
const common_1 = require("@nestjs/common");
const shifts_service_1 = require("./shifts.service");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../auth/decorators");
let ShiftsController = class ShiftsController {
    constructor(shiftsService) {
        this.shiftsService = shiftsService;
    }
    openShift(data, user) {
        return this.shiftsService.openShift(data, user);
    }
    closeShift(id, data, user) {
        return this.shiftsService.closeShift(id, data, user);
    }
    findAll(user, page, pageSize, storeId, status, userId) {
        const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
        const take = pageSize ? parseInt(pageSize) : 10;
        return this.shiftsService.findAll({
            skip,
            take,
            storeId: storeId ? parseInt(storeId) : undefined,
            status,
            userId: userId ? parseInt(userId) : undefined,
        }, user);
    }
    getCurrentShift(user) {
        return this.shiftsService.getCurrentShift(user);
    }
    getMyShifts(user, page, pageSize) {
        const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
        const take = pageSize ? parseInt(pageSize) : 10;
        return this.shiftsService.getMyShifts(user, { skip, take });
    }
    findOne(id, user) {
        return this.shiftsService.findOne(id, user);
    }
};
exports.ShiftsController = ShiftsController;
__decorate([
    (0, common_1.Post)('open'),
    (0, decorators_1.RequirePermissions)('open_shift'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ShiftsController.prototype, "openShift", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, decorators_1.RequirePermissions)('close_shift'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ShiftsController.prototype, "closeShift", null);
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.RequirePermissions)('view_shifts', 'view_own_shifts'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, common_1.Query)('storeId')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ShiftsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, decorators_1.RequirePermissions)('open_shift', 'close_shift'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ShiftsController.prototype, "getCurrentShift", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, decorators_1.RequirePermissions)('view_own_shifts'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ShiftsController.prototype, "getMyShifts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, decorators_1.RequirePermissions)('view_shifts', 'view_own_shifts'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ShiftsController.prototype, "findOne", null);
exports.ShiftsController = ShiftsController = __decorate([
    (0, common_1.Controller)('shifts'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [shifts_service_1.ShiftsService])
], ShiftsController);
//# sourceMappingURL=shifts.controller.js.map