
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';

import { PedidosService } from '../../services/pedidos';
import { Ventas } from '../ventas/ventas';

@Component({
  selector: 'app-captura-pedido',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Ventas],
  templateUrl: './captura-pedido.html',
  styleUrl: './captura-pedido.css'
})
export class CapturaPedido {

  tamanoOpciones = [
    { nombre: 'Chica', precio: 40 },
    { nombre: 'Mediana', precio: 80 },
    { nombre: 'Grande', precio: 120 }
  ];

  ingredientesOpciones = [
    { nombre: 'Jamón', precio: 10 },
    { nombre: 'Piña', precio: 10 },
    { nombre: 'Champiñones', precio: 10 }
  ];

  form: FormGroup;
  detalles: any[] = [];

  mensaje = '';
  error = '';
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private pedidosService: PedidosService
  ) {
    this.form = this.fb.group({
      nombre_cliente: ['', Validators.required],
      direccion: ['', Validators.required],

      telefono: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9+\-\s]{7,20}$/)
        ]
      ],

      fecha_pedido: [
        this.fechaActual(),
        Validators.required
      ],

      tamano: ['', Validators.required],

      ingredientes: this.fb.array(
        this.ingredientesOpciones.map(() => false)
      ),

      num_pizzas: [
        1,
        [Validators.required, Validators.min(1)]
      ]
    });
  }

  get ingredientesArray(): FormArray {
    return this.form.get('ingredientes') as FormArray;
  }

  fechaActual(): string {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  agregarPizza(): void {
    this.mensaje = '';
    this.error = '';

    const tamano = this.form.get('tamano')?.value;
    const cantidad = Number(this.form.get('num_pizzas')?.value);

    const tamanoSeleccionado = this.tamanoOpciones.find(
      p => p.nombre === tamano
    );

    const ingredientes = this.ingredientesOpciones.filter(
      (ingrediente, index) =>
        this.ingredientesArray.at(index).value === true
    );

    if (
      !tamanoSeleccionado ||
      ingredientes.length === 0 ||
      !Number.isInteger(cantidad) ||
      cantidad < 1
    ) {
      this.error = 'Selecciona tamaño, ingredientes y cantidad.';
      return;
    }

    const precioIngredientes = ingredientes.reduce(
      (total, ingrediente) => total + ingrediente.precio,
      0
    );

    const subtotal =
      (tamanoSeleccionado.precio + precioIngredientes) * cantidad;

    this.detalles.push({
      tamano: tamanoSeleccionado.nombre,
      ingredientes: ingredientes.map(i => i.nombre).join(', '),
      num_pizzas: cantidad,
      subtotal: subtotal
    });

    this.form.patchValue({
      tamano: '',
      num_pizzas: 1
    });

    this.ingredientesArray.controls.forEach(control => {
      control.setValue(false);
    });
  }

  quitarPizza(index: number): void {
    this.detalles.splice(index, 1);
  }

  get totalPedido(): number {
    return this.detalles.reduce(
      (total, pizza) => total + pizza.subtotal,
      0
    );
  }

  terminarPedido(): void {
    this.mensaje = '';
    this.error = '';

    const valores = this.form.getRawValue();

    this.form.get('nombre_cliente')?.markAsTouched();
    this.form.get('direccion')?.markAsTouched();
    this.form.get('telefono')?.markAsTouched();
    this.form.get('fecha_pedido')?.markAsTouched();

    if (
      this.form.get('nombre_cliente')?.invalid ||
      this.form.get('direccion')?.invalid ||
      this.form.get('telefono')?.invalid ||
      this.form.get('fecha_pedido')?.invalid
    ) {
      this.error = 'Completa correctamente los datos del cliente.';
      return;
    }

    if (this.detalles.length === 0) {
      this.error = 'Agrega al menos una pizza al pedido.';
      return;
    }

    const total = this.totalPedido;

    const datos = {
      nombre_cliente: valores.nombre_cliente,
      direccion: valores.direccion,
      telefono: valores.telefono,
      fecha_pedido: valores.fecha_pedido,
      total: total,
      detalles: this.detalles
    };

    this.guardando = true;

    this.pedidosService.registrarPedido(datos).subscribe({

      next: (respuesta: any) => {

        this.mensaje =
          `Pedido registrado correctamente. Total a pagar: $${total.toFixed(2)}`;

        this.detalles = [];

        this.form.reset({
          nombre_cliente: '',
          direccion: '',
          telefono: '',
          fecha_pedido: this.fechaActual(),
          tamano: '',
          num_pizzas: 1
        });

        this.ingredientesArray.controls.forEach(control => {
          control.setValue(false);
        });

        this.guardando = false;
      },

      error: (err) => {
        console.error('Error al registrar pedido:', err);
        this.error = 'No se pudo registrar el pedido.';
        this.guardando = false;
      }

    });
  }
}
