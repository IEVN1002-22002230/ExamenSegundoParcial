import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  private apiUrl = 'http://localhost:5000/api/pedidos';

  constructor(private http: HttpClient) {}

  obtenerPedidos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`);
  }

  obtenerPedido(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  registrarPedido(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/`, datos);
  }

  obtenerVentasDia(dia: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/ventas/dia/${dia}`);
  }

  obtenerVentasMes(mes: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/ventas/mes/${mes}`);
  }

}