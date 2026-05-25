export interface Product {
  id: number;
  name: string;
  description: string;
  fullDescription: string;
  price: string;
  priceNum: number;
  oldPrice?: string;
  category: string;
  badge?: string;
  imageText: string;
  rating?: number;
  reviews?: number;
  status: 'Disponible' | 'Agotado';
  relatedIds?: number[];
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Producto Premium',
    description: 'Descubre nuestro producto estrella con calidad incomparable y diseÃ±o moderno.',
    fullDescription: 'Este es nuestro producto mÃ¡s vendido. Cuenta con materiales de primera calidad, diseÃ±o ergonÃ³mico y garantÃ­a extendida.',
    price: '$299',
    priceNum: 299,
    oldPrice: '$399',
    category: 'destacados',
    badge: 'MÃ¡s Vendido',
    imageText: 'Producto Premium',
    rating: 5,
    reviews: 128,
    status: 'Disponible',
    relatedIds: [2, 3]
  },
  {
    id: 2,
    name: 'Producto Nuevo',
    description: 'La Ãºltima innovaciÃ³n en su categorÃ­a. Disponible por tiempo limitado.',
    fullDescription: 'Lanzamiento exclusivo con tecnologÃ­a de punta. Incluye accesorios adicionales y manual digital.',
    price: '$199',
    priceNum: 199,
    category: 'nuevos',
    badge: 'Nuevo',
    imageText: 'Producto Nuevo',
    rating: 4.5,
    reviews: 45,
    status: 'Disponible',
    relatedIds: [1, 7]
  },
  {
    id: 3,
    name: 'Oferta Especial',
    description: 'Aprovecha esta promociÃ³n Ãºnica con descuento especial por tiempo limitado.',
    fullDescription: 'Lanzamiento especial con precio rebajado. Ideal para clientes que buscan calidad y ahorro.',
    price: '$149',
    priceNum: 149,
    oldPrice: '$249',
    category: 'ofertas',
    badge: '30% OFF',
    imageText: 'Oferta Especial',
    rating: 4.8,
    reviews: 92,
    status: 'Disponible',
    relatedIds: [1, 6]
  },
  {
    id: 4,
    name: 'Paquete VIP',
    description: 'El paquete completo con beneficios exclusivos para clientes premium.',
    fullDescription: 'Accede a beneficios exclusivos como envÃ­o prioritario, atenciÃ³n personalizada y regalos sorpresa.',
    price: '$499',
    priceNum: 499,
    oldPrice: '$699',
    category: 'vip',
    badge: 'VIP',
    imageText: 'Paquete VIP',
    rating: 5,
    reviews: 67,
    status: 'Disponible',
    relatedIds: [8, 1]
  },
  {
    id: 5,
    name: 'Producto EstÃ¡ndar',
    description: 'La opciÃ³n perfecta para empezar. Calidad garantizada a un precio accesible.',
    fullDescription: 'Producto equilibrado que combina buen diseÃ±o, funcionalidad y precio accesible para cualquier cliente.',
    price: '$99',
    priceNum: 99,
    category: 'destacados',
    imageText: 'Producto EstÃ¡ndar',
    rating: 4.2,
    reviews: 234,
    status: 'Disponible',
    relatedIds: [3, 6]
  },
  {
    id: 6,
    name: 'Bundle Ahorro',
    description: 'Lleva 3 productos por el precio de 2. Ahorra hasta un 33%.',
    fullDescription: 'Pack especial con varios productos seleccionados para un ahorro real en tu compra.',
    price: '$199',
    priceNum: 199,
    oldPrice: '$297',
    category: 'ofertas',
    badge: '33% OFF',
    imageText: 'Bundle Ahorro',
    rating: 4.9,
    reviews: 56,
    status: 'Disponible',
    relatedIds: [3, 5]
  },
  {
    id: 7,
    name: 'EdiciÃ³n Limitada',
    description: 'ColecciÃ³n exclusiva con diseÃ±o Ãºnico. Disponible solo por temporada.',
    fullDescription: 'EdiciÃ³n de colecciÃ³n con detalles premium y piezas limitadas para clientes que buscan algo especial.',
    price: '$349',
    priceNum: 349,
    category: 'nuevos',
    badge: 'EdiciÃ³n Limitada',
    imageText: 'EdiciÃ³n Limitada',
    rating: 4.7,
    reviews: 34,
    status: 'Disponible',
    relatedIds: [2, 8]
  },
  {
    id: 8,
    name: 'Servicio Premium',
    description: 'Accede a beneficios exclusivos y atenciÃ³n prioritaria durante todo el aÃ±o.',
    fullDescription: 'Servicio mensual con beneficios especiales, soporte prioritario y acceso VIP a novedades.',
    price: '$99/mes',
    priceNum: 99,
    category: 'vip',
    badge: 'SuscripciÃ³n',
    imageText: 'Servicio Premium',
    rating: 4.6,
    reviews: 178,
    status: 'Disponible',
    relatedIds: [4, 7]
  }
];
