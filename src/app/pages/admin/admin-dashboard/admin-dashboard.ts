import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { StoreService } from '../../../store.service';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardPage {
  readonly store = inject(StoreService);
  readonly auth = inject(AuthService);
  readonly chartPoints = '10,215 50,195 90,180 130,150 170,158 210,122 250,96 290,92 330,118 370,140 410,132 450,105 490,152 530,124 570,98 610,136 650,92 690,76 730,54 770,20';
  readonly metricIcons = ['bi-box-seam', 'bi-archive', 'bi-tags', 'bi-people'];
  readonly stockByCategorySignal = computed(() => {
    const products = this.store.inventoryProducts();
    const categories = this.store.inventoryCategories();
    const bars = categories.map(category => {
      const relatedProducts = products.filter(product => product.category === category.name);
      const totalStock = relatedProducts.reduce((sum, product) => sum + product.stock, 0);

      return {
        name: category.name,
        stock: totalStock,
        products: relatedProducts.length
      };
    });

    const maxStock = Math.max(...bars.map(bar => bar.stock), 1);

    return bars.map(bar => ({
      ...bar,
      width: Math.max(12, Math.round((bar.stock / maxStock) * 100))
    }));
  });
  readonly stockHealthSignal = computed(() => {
    const products = this.store.inventoryProducts();
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const lowStock = this.store.getLowStockProducts().length;
    const averageStock = products.length ? Math.round(totalStock / products.length) : 0;

    return { totalStock, lowStock, averageStock };
  });
  readonly lowStockProductsSignal = computed(() => this.store.getLowStockProducts());

  stockByCategory() {
    return this.stockByCategorySignal();
  }

  stockHealth() {
    return this.stockHealthSignal();
  }

  lowStockProducts() {
    return this.lowStockProductsSignal();
  }

  get userName(): string {
    return this.auth.user()?.name ?? 'Admin';
  }
}
