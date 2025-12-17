import {
                    Controller,
                    Get,
                    Post,
                    Body,
                    Patch,
                    Param,
                    Delete,
                    Query,
                    ParseIntPipe,
                    UseGuards,
} from '@nestjs/common';
import { ChainsService } from './chains.service';
import { CreateChainDto, UpdateChainDto } from './dto/chain.dto';
import { JwtAuthGuard } from '../auth/guards';
import { RequirePermissions, RequireRoles } from '../auth/decorators';

@Controller('chains')
@UseGuards(JwtAuthGuard)
export class ChainsController {
                    constructor(private readonly chainsService: ChainsService) { }

                    @Post()
                    @RequireRoles('super_admin')
                    create(@Body() createChainDto: CreateChainDto) {
                                        return this.chainsService.create(createChainDto);
                    }

                    @Get()
                    @RequirePermissions('view_chains')
                    findAll(
                                        @Query('page') page?: string,
                                        @Query('pageSize') pageSize?: string,
                                        @Query('search') search?: string,
                                        @Query('status') status?: string,
                    ) {
                                        const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
                                        const take = pageSize ? parseInt(pageSize) : 10;

                                        return this.chainsService.findAll({ skip, take, search, status });
                    }

                    @Get(':id')
                    @RequirePermissions('view_chains', 'view_own_chain')
                    findOne(@Param('id', ParseIntPipe) id: number) {
                                        return this.chainsService.findOne(id);
                    }

                    @Get(':id/stats')
                    @RequirePermissions('view_chains', 'view_own_chain')
                    getStats(@Param('id', ParseIntPipe) id: number) {
                                        return this.chainsService.getStats(id);
                    }

                    @Patch(':id')
                    @RequirePermissions('edit_chain')
                    update(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Body() updateChainDto: UpdateChainDto,
                    ) {
                                        return this.chainsService.update(id, updateChainDto);
                    }

                    @Delete(':id')
                    @RequireRoles('super_admin')
                    remove(@Param('id', ParseIntPipe) id: number) {
                                        return this.chainsService.remove(id);
                    }
}
