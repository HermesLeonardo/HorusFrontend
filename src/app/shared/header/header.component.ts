import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [ThemeToggleComponent]
})
export class HeaderComponent {
  @Input() isSidebarCollapsed: boolean = false;  // Recebe o estado do sidebar
  @Output() toggleSidebar = new EventEmitter<void>();  // Emite o evento para alternar o sidebar

  onToggleSidebar(): void {
    this.toggleSidebar.emit();  // Dispara o evento para o AppComponent
  }
}
