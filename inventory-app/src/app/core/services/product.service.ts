import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private apiUrl = 'http://localhost:5169/api/Product';

    constructor(private http: HttpClient){}

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl);
    }

    getProductById(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }

    createProduct(formData: FormData): Observable<any> {
        return this.http.post(this.apiUrl, formData);
    }

    updateProduct(id: number, formData: FormData): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, formData, { responseType: 'text' });
    }

    deleteProduct(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, {responseType: 'text' });
    }
}