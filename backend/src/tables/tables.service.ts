import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  create(createTableDto: CreateTableDto) {
    return this.prisma.table.create({ data: createTableDto });
  }

  findAll() {
    return this.prisma.table.findMany();
  }

  findOne(id: number) {
    return this.prisma.table.findUnique({ where: { id } });
  }
}
