import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ThemeToggleComponent
  ]
})
export class DashboardComponent { }
