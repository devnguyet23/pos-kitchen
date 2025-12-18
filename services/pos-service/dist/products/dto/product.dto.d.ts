export declare class CreateProductDto {
    name: string;
    price: number;
    image?: string;
    categoryId: number;
    status?: number;
    modifierIds?: number[];
}
export declare class UpdateProductDto {
    name?: string;
    price?: number;
    image?: string;
    categoryId?: number;
    status?: number;
    modifierIds?: number[];
}
