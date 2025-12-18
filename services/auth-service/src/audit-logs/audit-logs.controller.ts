import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards';
import { RequirePermissions } from '../auth/decorators';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
@RequirePermissions('view_audit_logs')
export class AuditLogsController {
                    constructor(private readonly auditLogsService: AuditLogsService) { }

                    @Get()
                    findAll(
                                        @Query('page') page?: string,
                                        @Query('pageSize') pageSize?: string,
                                        @Query('userId') userId?: string,
                                        @Query('action') action?: string,
                                        @Query('model') model?: string,
                                        @Query('startDate') startDate?: string,
                                        @Query('endDate') endDate?: string,
                    ) {
                                        const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '20') : 0;
                                        const take = pageSize ? parseInt(pageSize) : 20;

                                        return this.auditLogsService.findAll({
                                                            skip,
                                                            take,
                                                            userId: userId ? parseInt(userId) : undefined,
                                                            action,
                                                            model,
                                                            startDate: startDate ? new Date(startDate) : undefined,
                                                            endDate: endDate ? new Date(endDate) : undefined,
                                        });
                    }

                    @Get('actions')
                    getActions() {
                                        return this.auditLogsService.getActions();
                    }

                    @Get('models')
                    getModels() {
                                        return this.auditLogsService.getModels();
                    }
}
