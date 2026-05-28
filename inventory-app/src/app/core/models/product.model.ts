export interface Product{
    id: number;
    productCode: string;
    productName: string;
    unit: string;
    category: string;
    mrp: number;
    imagePath: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface CreateProductRequest{
    productName: string;
    unit: string;
    category: string;
    mrp: number;
}

export interface UpdateProductRequest{
    productName: string;
    unit: string;
    category: string;
    mrp: number;
    isActive: boolean;
}
