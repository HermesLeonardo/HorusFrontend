import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProjetosComponent } from './pages/projetos/projetos.component';
import { AtividadesComponent } from './pages/atividades/atividades.component';
import { LancamentoHorasComponent } from './pages/lancamento-horas/lancamento-horas.component';
import { RelatoriosComponent } from './pages/relatorios/relatorios.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'projetos', component: ProjetosComponent },
  { path: 'atividades', component: AtividadesComponent },
  { path: 'lancamento-horas', component: LancamentoHorasComponent },
  { path: 'relatorios', component: RelatoriosComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
