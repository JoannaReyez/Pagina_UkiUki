import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { StoreService } from '../../../store.service';

type TrendPoint = {
  label: string;
  value: number;
  change: number;
  x: number;
  y: number;
};

type RankItem = {
  name: string;
  category?: string;
  value: number;
  width: number;
};

type SalesOverview = {
  totalSold: number;
  topProduct: {
    name: string;
    category: string;
    value: number;
  };
  topCategory: {
    name: string;
    value: number;
  };
};

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

  readonly weeklyStockTrendSignal = computed(() => {
    const rawPoints = [
      { label: 'Semana 1', value: 100, change: -10 },
      { label: 'Semana 2', value: 90, change: -10 },
      { label: 'Semana 3', value: 84, change: -7 },
      { label: 'Semana 4', value: 92, change: 10 }
    ];

    const values = rawPoints.map(point => point.value);
    const minValue = Math.max(0, Math.min(...values) - 8);
    const maxValue = Math.max(...values) + 8;
    const chartLeft = 36;
    const chartBottom = 220;
    const chartHeight = 150;
    const chartWidth = 668;
    const stepX = chartWidth / Math.max(rawPoints.length - 1, 1);

    const points: TrendPoint[] = rawPoints.map((point, index) => {
      const x = chartLeft + index * stepX;
      const y = chartBottom - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;

      return { ...point, x, y };
    });

    const smoothPath = `
  M ${points[0].x} ${points[0].y}
  C ${points[0].x + 80} ${points[0].y},
    ${points[1].x - 80} ${points[1].y},
    ${points[1].x} ${points[1].y}

  C ${points[1].x + 80} ${points[1].y},
    ${points[2].x - 80} ${points[2].y},
    ${points[2].x} ${points[2].y}

  C ${points[2].x + 80} ${points[2].y},
    ${points[3].x - 80} ${points[3].y},
    ${points[3].x} ${points[3].y}
`;

const areaPath = `
  ${smoothPath}
  L ${points[points.length - 1].x} ${chartBottom}
  L ${points[0].x} ${chartBottom}
  Z
`;

const overallChange = Math.round(
  ((points[points.length - 1].value - points[0].value)
  / points[0].value) * 100
);

return {
  points,
  smoothPath,
  areaPath,
  overallChange,
  minValue,
  maxValue
};
  });

  readonly salesOverviewSignal = computed<SalesOverview>(() => {
    const products = this.store.inventoryProducts();
    const categories = this.store.inventoryCategories();
    const movements = this.store.inventoryMovements();
    const productMap = new Map(products.map(product => [product.name, product]));
    const exitMovements = movements.filter(movement => movement.type === 'Salida');
    const totalSold = exitMovements.reduce((sum, movement) => sum + movement.quantity, 0);

    const categorySales = categories
      .map(category => {
        const total = exitMovements
          .filter(movement => productMap.get(movement.product)?.category === category.name)
          .reduce((sum, movement) => sum + movement.quantity, 0);

        return { name: category.name, value: total };
      })
      .sort((a, b) => b.value - a.value);

    const topProduct = products
      .map(product => ({
        name: product.name,
        category: product.category,
        value: exitMovements
          .filter(movement => movement.product === product.name)
          .reduce((sum, movement) => sum + movement.quantity, 0)
      }))
      .sort((a, b) => b.value - a.value)[0] ?? { name: 'Sin datos', category: '-', value: 0 };

    const topCategory = categorySales[0] ?? { name: 'Sin datos', value: 0 };

    return {
      totalSold,
      topProduct,
      topCategory
    };
  });

  readonly topProductsSignal = computed<RankItem[]>(() => {
    const products = this.store.inventoryProducts();
    const exitMovements = this.store.inventoryMovements().filter(movement => movement.type === 'Salida');
    const ranked = products
      .map(product => ({
        name: product.name,
        category: product.category,
        value: exitMovements
          .filter(movement => movement.product === product.name)
          .reduce((sum, movement) => sum + movement.quantity, 0)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    const maxValue = Math.max(...ranked.map(item => item.value), 1);

    return ranked.map(item => ({
      ...item,
      width: Math.max(12, Math.round((item.value / maxValue) * 100))
    }));
  });

  readonly topCategoriesSignal = computed<RankItem[]>(() => {
    const products = this.store.inventoryProducts();
    const categories = this.store.inventoryCategories();
    const movements = this.store.inventoryMovements().filter(movement => movement.type === 'Salida');
    const productMap = new Map(products.map(product => [product.name, product]));

    const ranked = categories
      .map(category => ({
        name: category.name,
        value: movements
          .filter(movement => productMap.get(movement.product)?.category === category.name)
          .reduce((sum, movement) => sum + movement.quantity, 0)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    const maxValue = Math.max(...ranked.map(item => item.value), 1);

    return ranked.map(item => ({
      ...item,
      width: Math.max(12, Math.round((item.value / maxValue) * 100))
    }));
  });

  readonly stockHealthSignal = computed(() => {
    const products = this.store.inventoryProducts();
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const lowStock = this.store.getLowStockProducts().length;
    const averageStock = products.length ? Math.round(totalStock / products.length) : 0;

    return { totalStock, lowStock, averageStock };
  });

  get userName(): string {
    return this.auth.user()?.name ?? 'Admin';
  }
}
