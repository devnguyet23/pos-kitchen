export interface CurrentUserData {
    id: number;
    username: string;
    email: string;
    chainId: number | null;
    storeId: number | null;
    roles: Array<{
        code: string;
        level: number;
        chainId: number | null;
        storeId: number | null;
    }>;
    permissions: string[];
}
export declare const CurrentUser: (...dataOrPipes: (keyof CurrentUserData | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>>)[]) => ParameterDecorator;
