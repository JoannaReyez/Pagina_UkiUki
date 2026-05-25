import { Routes } from '@angular/router';
import { Home } from '../component/home/home';
import { Productos } from '../component/productos/productos';
import { ProductDetail } from '../component/product-detail/product-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'web', pathMatch: 'full' },
  { path: 'web', component: Home },
  { path: 'productos', component: Productos },
  { path: 'producto/:id', component: ProductDetail }
];
