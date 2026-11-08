
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidosService } from '../../services/pedidos';

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-pedido.html',
  styleUrl: './detalle-pedido.css'
})
export class DetallePedido implements OnInit {

  pedidos: any[] = [];
  pedidoSeleccionado: any = null;
  detalles: any[] = [];
  cargando = false;
  error = '';

  constructor(
    private pedidosService: PedidosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando = true;
    this.error = '';

    this.pedidosService.obtenerPedidos().subscribe({

      next: (respuesta) => {
        this.pedidos = respuesta;
        this.cargando = false;

        this.cdr.detectChanges();

        console.log('Pedidos cargados automáticamente:', this.pedidos);
      },

      error: (err) => {
        console.error('Error al consultar pedidos:', err);

        this.error = 'No fue posible cargar los pedidos.';
        this.cargando = false;

        this.cdr.detectChanges();
      }

    });
  }

  consultarDetalle(id: number): void {
    this.error = '';

    this.pedidosService.obtenerPedido(id).subscribe({

      next: (respuesta) => {
        this.pedidoSeleccionado = respuesta.pedido;
        this.detalles = respuesta.detalles;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al consultar detalle:', err);

        this.error = 'No fue posible consultar el detalle.';

        this.cdr.detectChanges();
      }

    });
  }

  cerrarDetalle(): void {
    this.pedidoSeleccionado = null;
    this.detalles = [];
  }

}
