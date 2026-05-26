import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  currentYear = new Date().getFullYear();

  socialLinks = [
    { icon: 'bi-facebook', url: '#', name: 'Facebook' },
    { icon: 'bi-instagram', url: '#', name: 'Instagram' },
    { icon: 'bi-tiktok', url: '#', name: 'TikTok' },
    { icon: 'bi-whatsapp', url: '#', name: 'WhatsApp' },
    { icon: 'bi-youtube', url: '#', name: 'YouTube' },
  ];

  navigationLinks = [
    { label: 'Nosotros', url: '#about' },
    { label: 'Servicios', url: '#services' },
    { label: 'Galeria', url: '#gallery' },
    { label: 'Testimonios', url: '#testimonials' },
  ];

  schedule = [
    { day: 'Lunes - Viernes', time: '9:00 - 20:00' },
    { day: 'Sabado', time: '10:00 - 18:00' },
    { day: 'Domingo', time: '[ Tu horario ]' },
  ];

  contactInfo = [
    { icon: 'bi-geo-alt-fill', text: 'Tu direccion aqui, Ciudad' },
    { icon: 'bi-telephone-fill', text: '+52 (123) 456-7890' },
    { icon: 'bi-envelope-fill', text: 'correo@tunegocio.com' },
    { icon: 'bi-whatsapp', text: '+52 (123) 456-7890' },
  ];
}
