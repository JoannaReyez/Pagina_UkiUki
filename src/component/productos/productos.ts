import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginModal } from '../../modales/login-modal/login-modal';
import { Footer } from '../footer/footer';
import { Navbar } from '../navbar/navbar';

interface Product {
  id: number;
  name: string;
  description: string;
  fullDescription?: string;
  price: string;
  priceNum: number;
  oldPrice?: string;
  category: string;
  badge?: string;
  imageText: string;
  rating?: number;
  reviews?: number;
  features?: string[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoginModal, Footer, Navbar],
  templateUrl: './productos.html',
  styleUrl: './productos.scss'
})
export class Productos implements OnInit, OnDestroy {
  isScrolled = false;
  menuOpen = false;
  showLoginModal = false;

  constructor() {}

  activeCategory = 'all';
  searchTerm = '';
  showToast = false;
  toastMessage = '';
  selectedProduct: Product | null = null;

  // CARRITO
  cartOpen = false;
  cartItems: CartItem[] = [];
  cartBounce = false;

  get cartCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  get cartTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.product.priceNum * item.quantity, 0);
  }

  categories = [
    { id: 'all', name: 'Todos', icon: 'bi-grid-3x3-gap-fill' },
    { id: 'destacados', name: 'Destacados', icon: 'bi-star-fill' },
    { id: 'nuevos', name: 'Nuevos', icon: 'bi-megaphone-fill' },
    { id: 'ofertas', name: 'Ofertas', icon: 'bi-tag-fill' },
    { id: 'vip', name: 'VIP', icon: 'bi-diamond-fill' }
  ];

  products: Product[] = [
    {
      id: 1,
      name: 'Producto Premium',
      description: 'Descubre nuestro producto estrella con calidad incomparable y diseño moderno.',
      fullDescription: 'Este es nuestro producto más vendido. Cuenta con materiales de primera calidad, diseño ergonómico y garantía extendida.',
      price: '$299',
      priceNum: 299,
      oldPrice: '$399',
      category: 'destacados',
      badge: 'Más Vendido',
      imageText: 'Producto Premium',
      rating: 5,
      reviews: 128,
      features: ['Material premium', 'Garantía 2 años', 'Envío gratis', 'Soporte 24/7']
    },
    {
      id: 2,
      name: 'Producto Nuevo',
      description: 'La última innovación en su categoría. Disponible por tiempo limitado.',
      fullDescription: 'Lanzamiento exclusivo con tecnología de punta. Incluye accesorios adicionales y manual digital.',
      price: '$199',
      priceNum: 199,
      category: 'nuevos',
      badge: 'Nuevo',
      imageText: 'Producto Nuevo',
      rating: 4.5,
      reviews: 45,
      features: ['Tecnología avanzada', 'Incluye accesorios', 'Manual digital']
    },
    {
      id: 3,
      name: 'Oferta Especial',
      description: 'Aprovecha esta promoción única con descuento especial por tiempo limitado.',
      price: '$149',
      priceNum: 149,
      oldPrice: '$249',
      category: 'ofertas',
      badge: '30% OFF',
      imageText: 'Oferta Especial',
      rating: 4.8,
      reviews: 92,
      features: ['Precio especial', 'Stock limitado', 'Envío rápido']
    },
    {
      id: 4,
      name: 'Paquete VIP',
      description: 'El paquete completo con beneficios exclusivos para clientes premium.',
      fullDescription: 'Accede a beneficios exclusivos como envío prioritario, atención personalizada y regalos sorpresa.',
      price: '$499',
      priceNum: 499,
      oldPrice: '$699',
      category: 'vip',
      badge: 'VIP',
      imageText: 'Paquete VIP',
      rating: 5,
      reviews: 67,
      features: ['Envío prioritario', 'Atención personalizada', 'Regalos exclusivos', 'Soporte VIP']
    },
    {
      id: 5,
      name: 'Producto Estándar',
      description: 'La opción perfecta para empezar. Calidad garantizada a un precio accesible.',
      price: '$99',
      priceNum: 99,
      category: 'destacados',
      imageText: 'Producto Estándar',
      rating: 4.2,
      reviews: 234,
      features: ['Calidad garantizada', 'Precio accesible', 'Ideal para empezar']
    },
    {
      id: 6,
      name: 'Bundle Ahorro',
      description: 'Lleva 3 productos por el precio de 2. Ahorra hasta un 33%.',
      price: '$199',
      priceNum: 199,
      oldPrice: '$297',
      category: 'ofertas',
      badge: '33% OFF',
      imageText: 'Bundle Ahorro',
      rating: 4.9,
      reviews: 56,
      features: ['Ahorro garantizado', 'Productos complementarios', 'Envío incluido']
    },
    {
      id: 7,
      name: 'Edición Limitada',
      description: 'Colección exclusiva con diseño único. Disponible solo por temporada.',
      price: '$349',
      priceNum: 349,
      category: 'nuevos',
      badge: 'Edición Limitada',
      imageText: 'Edición Limitada',
      rating: 4.7,
      reviews: 34,
      features: ['Diseño único', 'Edición limitada', 'Certificado autenticidad']
    },
    {
      id: 8,
      name: 'Servicio Premium',
      description: 'Accede a beneficios exclusivos y atención prioritaria durante todo el año.',
      price: '$99/mes',
      priceNum: 99,
      category: 'vip',
      badge: 'Suscripción',
      imageText: 'Servicio Premium',
      rating: 4.6,
      reviews: 178,
      features: ['Atención prioritaria', 'Beneficios exclusivos', 'Sin permanencia']
    }
  ];

  get filteredProducts(): Product[] {
    let filtered = this.products;
    if (this.activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.activeCategory);
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }
    return filtered;
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 80;
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu(): void { this.menuOpen = false; }
  filterByCategory(categoryId: string): void { this.activeCategory = categoryId; }
  onSearch(): void {}

  resetFilters(): void {
    this.activeCategory = 'all';
    this.searchTerm = '';
  }

  getRatingStars(rating: number): number[] { return Array(Math.floor(rating)).fill(0); }
  getEmptyStars(rating: number): number[] { return Array(5 - Math.floor(rating)).fill(0); }

  quickView(product: Product): void {
    this.selectedProduct = product;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.selectedProduct = null;
    if (!this.cartOpen) document.body.style.overflow = '';
  }

  // LOGIN MODAL
  openLoginModal(): void {
    this.closeMenu();
    this.showLoginModal = true;
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
    document.body.style.overflow = '';
  }

  handleLogin(_credentials: { email: string; password: string; role?: string }): void {
    this.showToast = true;
    this.toastMessage = 'Sesión iniciada correctamente';
    setTimeout(() => { this.showToast = false; }, 3000);
  }

  // CARRITO
  toggleCart(): void {
    this.cartOpen = !this.cartOpen;
    document.body.style.overflow = this.cartOpen ? 'hidden' : '';
  }

  closeCart(): void {
    this.cartOpen = false;
    document.body.style.overflow = '';
  }

  addToCart(product: Product): void {
    const existing = this.cartItems.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cartItems.push({ product, quantity: 1 });
    }
    
    // Activar animación de rebote
    this.triggerBounce();
    
    this.toastMessage = `${product.name} agregado al carrito`;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }

  triggerBounce(): void {
    this.cartBounce = true;
    setTimeout(() => {
      this.cartBounce = false;
    }, 600);
  }

  removeFromCart(index: number): void {
    this.cartItems.splice(index, 1);
  }

  increaseQty(index: number): void {
    this.cartItems[index].quantity++;
  }

  decreaseQty(index: number): void {
    if (this.cartItems[index].quantity > 1) {
      this.cartItems[index].quantity--;
    } else {
      this.removeFromCart(index);
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.closeCart();
  }

  checkout(): void {
    const items = this.cartItems.map(i => `• ${i.product.name} x${i.quantity}`).join('%0A');
    const total = `Total: $${this.cartTotal}`;
    const msg = `Hola! Me interesan estos productos:%0A${items}%0A${total}`;
    window.open(`https://wa.me/521234567890?text=${msg}`, '_blank');
  }
}
