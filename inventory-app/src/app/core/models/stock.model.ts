export interface StockTransaction{
    productId: number;
    transactionType: string;
    quantity: number;
    remarks: string;
}

export interface StockResponse{
    id: number;
    productCode: string;
    productName: string;
    transactionType: string;
    quantity: number;
    remarks: string;
    transactionDate: string;
    createdBy: string;
}

export interface StockSummary{
    productId: number;
    productCode: string;
    productName: string;
    unit: string;
    category: string;
    mrp: number;
    totalIn: number;
    totalOut: number;
    currentStock: number;
}