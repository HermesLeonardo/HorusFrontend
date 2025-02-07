import { Component } from '@angular/core';


@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
  standalone: true
})
export class UserDashboardComponent {
  title = 'Painel do Usuário';
}
