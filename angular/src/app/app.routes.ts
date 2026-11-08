
import { Routes } from '@angular/router';

import { CapturaPedido } from './components/captura-pedido/captura-pedido';
import { DetallePedido } from './components/detalle-pedido/detalle-pedido';
import { Ventas } from './components/ventas/ventas';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'captura',
    pathMatch: 'full'
  },

  {
    path: 'captura',
    component: CapturaPedido
  },

  {
    path: 'detalle',
    component: DetallePedido
  },

  {
    path: 'ventas',
    component: Ventas
  },

  {
    path: '**',
    redirectTo: 'captura'
  }

];
