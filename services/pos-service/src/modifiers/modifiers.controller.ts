import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ModifiersService } from './modifiers.service';
import { CreateModifierDto, UpdateModifierDto } from './dto/modifier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('modifiers')
@UseGuards(JwtAuthGuard)
export class ModifiersController {
                    constructor(private readonly modifiersService: ModifiersService) { }

                    @Post()
                    @RequirePermissions('manage_product_variants')
                    create(
                                        @Body() createModifierDto: CreateModifierDto,
                                        @CurrentUser() user: CurrentUserData,
                    ) {
                                        return this.modifiersService.create(createModifierDto, user);
                    }

                    @Get()
                    @RequirePermissions('view_products')
                    findAll(@CurrentUser() user: CurrentUserData) {
                                        return this.modifiersService.findAll(user);
                    }

                    @Get(':id')
                    @RequirePermissions('view_products')
                    findOne(@Param('id', ParseIntPipe) id: number) {
                                        return this.modifiersService.findOne(id);
                    }

                    @Put(':id')
                    @RequirePermissions('manage_product_variants')
                    update(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Body() updateModifierDto: UpdateModifierDto,
                    ) {
                                        return this.modifiersService.update(id, updateModifierDto);
                    }

                    @Delete(':id')
                    @RequirePermissions('manage_product_variants')
                    remove(@Param('id', ParseIntPipe) id: number) {
                                        return this.modifiersService.remove(id);
                    }
}
