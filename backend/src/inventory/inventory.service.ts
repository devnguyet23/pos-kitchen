import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.ingredient.findMany();
  }

  /**
   * Deduct ingredients from stock based on order items and recipes.
   */
  async deductForOrder(orderId: number) {
    // 1. Fetch Order Items with Product Recipes
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId },
      include: {
        product: {
          include: {
            recipes: {
              include: { ingredient: true },
            },
          },
        },
      },
    });

    for (const item of orderItems) {
      const quantitySold = item.quantity;
      
      // If product has recipes (BOM)
      if (item.product.recipes && item.product.recipes.length > 0) {
        for (const recipe of item.product.recipes) {
          const amountToDeduct = recipe.quantity * quantitySold;
          
          if (recipe.ingredient.stock < amountToDeduct) {
             this.logger.warn(`Not enough stock for ${recipe.ingredient.name}. Needed: ${amountToDeduct}, Available: ${recipe.ingredient.stock}`);
          }

          // Update Stock
          await this.prisma.ingredient.update({
            where: { id: recipe.ingredientId },
            data: {
              stock: { decrement: amountToDeduct },
            },
          });
          
          this.logger.log(`Deducted ${amountToDeduct} ${recipe.ingredient.unit} of ${recipe.ingredient.name} for Order #${orderId}`);
        }
      }
    }
  }
}
