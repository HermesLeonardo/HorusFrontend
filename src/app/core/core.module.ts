import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { ProjetosService } from './services/projetos.service';
import { UsuariosService } from './services/usuarios.service';



@NgModule({
  providers: [AuthService, ProjetosService, UsuariosService, ThemeService],
  imports: [CommonModule]
})
export class CoreModule {}
