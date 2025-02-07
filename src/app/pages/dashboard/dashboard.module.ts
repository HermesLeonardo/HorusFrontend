import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { RouterModule } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

@NgModule({
  declarations: [AdminDashboardComponent, UserDashboardComponent],
  imports: [CommonModule, RouterModule],
  exports: [AdminDashboardComponent, UserDashboardComponent]
})
export class DashboardModule { }
