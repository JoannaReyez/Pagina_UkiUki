import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StoreService } from '../../../store.service';

@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.scss'
})
export class AdminSettingsPage {
  constructor(public store: StoreService) {}
}
