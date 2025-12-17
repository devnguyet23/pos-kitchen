import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModifierDto, UpdateModifierDto } from './dto/modifier.dto';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { BaseTenantService } from '../common/base-tenant.service';

@Injectable()
export class ModifiersService extends BaseTenantService {
                    constructor(private prisma: PrismaService) {
                                        super();
                    }

                    async create(createModifierDto: CreateModifierDto, user?: CurrentUserData) {
                                        return this.prisma.modifier.create({
                                                            data: {
                                                                                ...createModifierDto,
                                                                                ...(user?.chainId && { chainId: user.chainId }),
                                                            },
                                        });
                    }

                    findAll(user?: CurrentUserData) {
                                        const where: any = {};
                                        if (user?.chainId) {
                                                            where.chainId = user.chainId;
                                        }
                                        return this.prisma.modifier.findMany({ where });
                    }

                    async findOne(id: number) {
                                        const modifier = await this.prisma.modifier.findUnique({
                                                            where: { id },
                                        });

                                        if (!modifier) {
                                                            throw new NotFoundException(`Modifier with ID ${id} not found`);
                                        }

                                        return modifier;
                    }

                    async update(id: number, updateModifierDto: UpdateModifierDto) {
                                        await this.findOne(id);

                                        return this.prisma.modifier.update({
                                                            where: { id },
                                                            data: updateModifierDto,
                                        });
                    }

                    async remove(id: number) {
                                        await this.findOne(id);

                                        // Check if modifier is used by any products
                                        const productModifierCount = await this.prisma.productModifier.count({
                                                            where: { modifierId: id },
                                        });

                                        if (productModifierCount > 0) {
                                                            throw new NotFoundException(
                                                                                `Không thể xóa modifier này vì đang được sử dụng bởi ${productModifierCount} sản phẩm.`
                                                            );
                                        }

                                        return this.prisma.modifier.delete({
                                                            where: { id },
                                        });
                    }
}
