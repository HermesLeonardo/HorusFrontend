import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;

  constructor(private router: Router) {}

 navegar(rota: string): void {
    this.router.navigate([rota]);
  }
}
