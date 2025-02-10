import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;  
}
