"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoresManagementModule = void 0;
const common_1 = require("@nestjs/common");
const stores_management_service_1 = require("./stores-management.service");
const stores_management_controller_1 = require("./stores-management.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let StoresManagementModule = class StoresManagementModule {
};
exports.StoresManagementModule = StoresManagementModule;
exports.StoresManagementModule = StoresManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [stores_management_controller_1.StoresManagementController],
        providers: [stores_management_service_1.StoresManagementService],
        exports: [stores_management_service_1.StoresManagementService],
    })
], StoresManagementModule);
//# sourceMappingURL=stores-management.module.js.map