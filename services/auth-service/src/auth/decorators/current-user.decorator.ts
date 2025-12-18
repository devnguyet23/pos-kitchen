import { createParamDecorator, ExecutionContext } from '@nestjs/common';

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

export const CurrentUser = createParamDecorator(
                    (data: keyof CurrentUserData | undefined, ctx: ExecutionContext): CurrentUserData | any => {
                                        const request = ctx.switchToHttp().getRequest();
                                        const user = request.user as CurrentUserData;

                                        if (!user) {
                                                            return null;
                                        }

                                        return data ? user[data] : user;
                    },
);
