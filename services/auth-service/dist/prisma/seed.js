"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    const drinkCat = await prisma.category.create({ data: { name: 'Drinks' } });
    const foodCat = await prisma.category.create({ data: { name: 'Food' } });
    const coffee = await prisma.product.create({
        data: {
            name: 'Cafe Sua Da',
            price: 2.5,
            categoryId: drinkCat.id,
        },
    });
    const pho = await prisma.product.create({
        data: {
            name: 'Pho Bo',
            price: 5.0,
            categoryId: foodCat.id,
        },
    });
    const coffeeBean = await prisma.ingredient.create({
        data: { name: 'Coffee Bean', unit: 'g', stock: 1000, cost: 0.05 }
    });
    const milk = await prisma.ingredient.create({
        data: { name: 'Condensed Milk', unit: 'ml', stock: 500, cost: 0.02 }
    });
    const beef = await prisma.ingredient.create({
        data: { name: 'Beef', unit: 'g', stock: 5000, cost: 0.1 }
    });
    await prisma.recipe.create({
        data: { productId: coffee.id, ingredientId: coffeeBean.id, quantity: 20 }
    });
    await prisma.recipe.create({
        data: { productId: coffee.id, ingredientId: milk.id, quantity: 30 }
    });
    const sugarMod = await prisma.modifier.create({
        data: {
            name: 'Sugar Level',
            options: JSON.stringify(['0%', '30%', '50%', '70%', '100%'])
        }
    });
    const iceMod = await prisma.modifier.create({
        data: {
            name: 'Ice Level',
            options: JSON.stringify(['No Ice', 'Less Ice', 'Normal', 'Extra Ice'])
        }
    });
    await prisma.productModifier.create({
        data: { productId: coffee.id, modifierId: sugarMod.id }
    });
    await prisma.productModifier.create({
        data: { productId: coffee.id, modifierId: iceMod.id }
    });
    await prisma.table.createMany({
        data: [
            { name: 'Table 1', x: 0, y: 0, status: 'AVAILABLE' },
            { name: 'Table 2', x: 1, y: 0, status: 'AVAILABLE' },
            { name: 'Table 3', x: 2, y: 0, status: 'OCCUPIED' },
            { name: 'Table 4', x: 0, y: 1, status: 'RESERVED' },
        ],
    });
    console.log('Seeding finished.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map