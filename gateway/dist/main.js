"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Gateway');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`🚀 API Gateway running on http://localhost:${port}`);
    logger.log(`📡 Auth Service: ${process.env.AUTH_SERVICE_URL || 'http://localhost:3002'}`);
    logger.log(`📡 POS Service: ${process.env.POS_SERVICE_URL || 'http://localhost:3003'}`);
}
bootstrap();
//# sourceMappingURL=main.js.map