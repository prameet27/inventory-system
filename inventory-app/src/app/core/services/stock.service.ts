import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockTransaction, StockResponse, StockSummary } from '../models/stock.model';

@Injectable({ providedIn: 'root' })
export class StockService {
    private apiUrl = 'http://localhost:5169/api/Stock';

    constructor(private http: HttpClient) {}

    addTransaction(transaction: StockTransaction): Observable<any> {
        return this.http.post(`${this.apiUrl}/transaction`, transaction, { responseType: 'text' });
    }

    getStockSummary(): Observable<StockSummary[]>{
        return this.http.get<StockSummary[]>(`${this.apiUrl}/summary`);
    }

    getAllTransactions(): Observable<StockResponse[]>{
        return this.http.get<StockResponse[]>(`${this.apiUrl}/transactions`);
    }

    getTransactionsByProduct(productId: number): Observable<StockResponse[]>{
        return this.http.get<StockResponse[]>(`${this.apiUrl}/transactions/${productId}`);
    }

    getStockReport(from?: string, to?: string, category?: string): Observable<StockResponse[]>{
        let params = '';
        if (from) params += `?from=${from}`;
        if (to) params += `${params ? '&' : '?'}to=${to}`;
        if (category) params += `${params ? '&' : '?' }category=${category}`;
        return this.http.get<StockResponse[]>(`${this.apiUrl}/report${params}`);
    }
}