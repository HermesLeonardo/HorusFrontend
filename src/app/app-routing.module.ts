import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProjetosComponent } from './pages/projetos/projetos.component';
import { AtividadeComponent } from './pages/atividades/atividades.component';
import { LancamentoHorasComponent } from './pages/lancamento-horas/lancamento-horas.component';
import { RelatoriosComponent } from './pages/relatorios/relatorios.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './pages/dashboard/user-dashboard/user-dashboard.component';


export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'dashboard/admin', component: AdminDashboardComponent },  
  { path: 'dashboard/user', component: UserDashboardComponent },    
  { path: 'projetos', component: ProjetosComponent },
  { path: 'atividades', component: AtividadeComponent },
  { path: 'lancamento-horas', component: LancamentoHorasComponent },
  { path: 'relatorios', component: RelatoriosComponent },
  { path: 'usuarios', loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent) },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
