import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ModifiersService } from './modifiers.service';
import { CreateModifierDto, UpdateModifierDto } from './dto/modifier.dto';

@Controller('modifiers')
export class ModifiersController {
                    constructor(private readonly modifiersService: ModifiersService) { }

                    @Post()
                    create(@Body() createModifierDto: CreateModifierDto) {
                                        return this.modifiersService.create(createModifierDto);
                    }

                    @Get()
                    findAll() {
                                        return this.modifiersService.findAll();
                    }

                    @Get(':id')
                    findOne(@Param('id', ParseIntPipe) id: number) {
                                        return this.modifiersService.findOne(id);
                    }

                    @Put(':id')
                    update(
                                        @Param('id', ParseIntPipe) id: number,
                                        @Body() updateModifierDto: UpdateModifierDto,
                    ) {
                                        return this.modifiersService.update(id, updateModifierDto);
                    }

                    @Delete(':id')
                    remove(@Param('id', ParseIntPipe) id: number) {
                                        return this.modifiersService.remove(id);
                    }
}
