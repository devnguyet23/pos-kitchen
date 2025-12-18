import { Controller, Get } from '@nestjs/common';
import axios from 'axios';

interface ServiceHealth {
                    name: string;
                    status: 'up' | 'down';
                    responseTime?: number;
                    error?: string;
}

@Controller('health')
export class HealthController {
                    private readonly services = [
                                        { name: 'auth-service', url: process.env.AUTH_SERVICE_URL || 'http://localhost:3002' },
                                        { name: 'pos-service', url: process.env.POS_SERVICE_URL || 'http://localhost:3003' },
                                        { name: 'report-service', url: process.env.REPORT_SERVICE_URL || 'http://localhost:3004' },
                    ];

                    @Get()
                    async getHealth() {
                                        const serviceHealth = await Promise.all(
                                                            this.services.map(service => this.checkService(service.name, service.url))
                                        );

                                        const allHealthy = serviceHealth.every(s => s.status === 'up');

                                        return {
                                                            status: allHealthy ? 'healthy' : 'degraded',
                                                            service: 'gateway',
                                                            version: '1.0.0',
                                                            uptime: process.uptime(),
                                                            timestamp: new Date().toISOString(),
                                                            services: serviceHealth,
                                        };
                    }

                    @Get('live')
                    getLiveness() {
                                        return {
                                                            status: 'ok',
                                                            timestamp: new Date().toISOString(),
                                        };
                    }

                    @Get('ready')
                    async getReadiness() {
                                        const authHealth = await this.checkService(
                                                            'auth-service',
                                                            process.env.AUTH_SERVICE_URL || 'http://localhost:3002'
                                        );

                                        return {
                                                            status: authHealth.status === 'up' ? 'ready' : 'not_ready',
                                                            timestamp: new Date().toISOString(),
                                        };
                    }

                    private async checkService(name: string, url: string): Promise<ServiceHealth> {
                                        const start = Date.now();
                                        try {
                                                            await axios.get(`${url}/health`, { timeout: 5000 });
                                                            return {
                                                                                name,
                                                                                status: 'up',
                                                                                responseTime: Date.now() - start,
                                                            };
                                        } catch (error) {
                                                            return {
                                                                                name,
                                                                                status: 'down',
                                                                                responseTime: Date.now() - start,
                                                                                error: error instanceof Error ? error.message : 'Unknown error',
                                                            };
                                        }
                    }
}
