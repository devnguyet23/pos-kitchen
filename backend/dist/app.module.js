"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const prisma_module_1 = require("./prisma/prisma.module");
const cache_module_1 = require("./cache/cache.module");
const sharding_module_1 = require("./sharding/sharding.module");
const event_bus_module_1 = require("./event-bus/event-bus.module");
const health_module_1 = require("./health/health.module");
const events_module_1 = require("./events/events.module");
const invoices_module_1 = require("./invoices/invoices.module");
const reports_module_1 = require("./reports/reports.module");
const products_module_1 = require("./products/products.module");
const orders_module_1 = require("./orders/orders.module");
const modifiers_module_1 = require("./modifiers/modifiers.module");
const categories_module_1 = require("./categories/categories.module");
const upload_module_1 = require("./upload/upload.module");
const auth_module_1 = require("./auth/auth.module");
const chains_module_1 = require("./chains/chains.module");
const stores_management_module_1 = require("./stores-management/stores-management.module");
const users_module_1 = require("./users/users.module");
const roles_module_1 = require("./roles/roles.module");
const permissions_module_1 = require("./permissions/permissions.module");
const shifts_module_1 = require("./shifts/shifts.module");
const audit_logs_module_1 = require("./audit-logs/audit-logs.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            prisma_module_1.PrismaModule,
            cache_module_1.CacheModule,
            sharding_module_1.ShardingModule,
            event_bus_module_1.EventBusModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            chains_module_1.ChainsModule,
            stores_management_module_1.StoresManagementModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            permissions_module_1.PermissionsModule,
            shifts_module_1.ShiftsModule,
            audit_logs_module_1.AuditLogsModule,
            events_module_1.EventsModule,
            invoices_module_1.InvoicesModule,
            reports_module_1.ReportsModule,
            products_module_1.ProductsModule,
            orders_module_1.OrdersModule,
            modifiers_module_1.ModifiersModule,
            categories_module_1.CategoriesModule,
            upload_module_1.UploadModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map