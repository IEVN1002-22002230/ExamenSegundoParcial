
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidosService } from '../../services/pedidos';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class Ventas {

  diaSeleccionado = '';
  mesSeleccionado = '';

  ventasDia: any[] = [];
  ventasMes: any[] = [];

  totalDia = '0.00';
  totalMes = '0.00';

  mensajeDia = '';
  mensajeMes = '';

  cargandoDia = false;
  cargandoMes = false;

  consultadoDia = false;
  consultadoMes = false;

  constructor(private pedidosService: PedidosService) {}

  limpiarVentasDia(): void {
    this.ventasDia = [];
    this.totalDia = '0.00';
    this.mensajeDia = '';
    this.consultadoDia = false;
  }

  limpiarVentasMes(): void {
    this.ventasMes = [];
    this.totalMes = '0.00';
    this.mensajeMes = '';
    this.consultadoMes = false;
  }

  consultarVentasDia(): void {

    if (!this.diaSeleccionado || this.cargandoDia) {
      return;
    }

    this.cargandoDia = true;
    this.mensajeDia = '';
    this.consultadoDia = true;

    this.pedidosService.obtenerVentasDia(this.diaSeleccionado)
      .subscribe({
        next: (respuesta: any) => {
          this.ventasDia = respuesta.ventas || [];
          this.totalDia = respuesta.total_acumulado || '0.00';
          this.cargandoDia = false;
        },
        error: (error) => {
          this.ventasDia = [];
          this.totalDia = '0.00';
          this.mensajeDia = 'Error al consultar las ventas del día';
          this.cargandoDia = false;
          console.error(error);
        }
      });
  }

  consultarVentasMes(): void {

    if (!this.mesSeleccionado || this.cargandoMes) {
      return;
    }

    this.cargandoMes = true;
    this.mensajeMes = '';
    this.consultadoMes = true;

    this.pedidosService.obtenerVentasMes(this.mesSeleccionado)
      .subscribe({
        next: (respuesta: any) => {
          this.ventasMes = respuesta.ventas || [];
          this.totalMes = respuesta.total_acumulado || '0.00';
          this.cargandoMes = false;
        },
        error: (error) => {
          this.ventasMes = [];
          this.totalMes = '0.00';
          this.mensajeMes = 'Error al consultar las ventas del mes';
          this.cargandoMes = false;
          console.error(error);
        }
      });
  }
}
