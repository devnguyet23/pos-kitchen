import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class ProxyMiddleware implements NestMiddleware {
    private readonly logger;
    private readonly authServiceUrl;
    private readonly posServiceUrl;
    private readonly reportServiceUrl;
    private readonly routeMap;
    private proxyCache;
    use(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
    private getTargetUrl;
    private createProxy;
    private generateRequestId;
}
