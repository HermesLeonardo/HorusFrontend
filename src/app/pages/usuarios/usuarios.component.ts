import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Usuario } from '../../core/model/usuario.model';
import { UsuariosService } from '../../core/services/usuarios.service';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { ListboxModule } from 'primeng/listbox';
import { CardModule } from 'primeng/card';



@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  providers: [MessageService, ConfirmationService],
  imports: [
    TableModule,
    DropdownModule,
    FormsModule,
    CommonModule,
    DialogModule,
    ConfirmDialogModule,
    ButtonModule,
    ToastModule,
    MultiSelectModule,
    ListboxModule,
    CardModule
  ],
  standalone: true
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  usuarioSelecionado: Usuario = this.novoUsuario();
  exibirDialog: boolean = false;
  filtro = { nome: '', perfil: null };

  perfis = [
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Usuário', value: 'USUARIO' }
  ];

  constructor(
    private usuariosService: UsuariosService,
    private messageService: MessageService

  ) { console.log('🚀 UsuariosComponent CONSTRUTOR chamado!'); }

  filtrarUsuarios(): void {
    this.usuariosFiltrados = this.usuarios.filter(usuario =>
      (this.filtro.nome ? usuario.nome.toLowerCase().includes(this.filtro.nome.toLowerCase()) : true) &&
      (this.filtro.perfil ? usuario.perfil === this.filtro.perfil : true)
    );
  }

  resetarFiltros(): void {
    this.filtro = { nome: '', perfil: null };
    this.filtrarUsuarios(); // Atualiza a tabela com a lista original sem filtros
  }

  mostrarUsuariosDesativados(): void {
    this.usuariosFiltrados = this.usuarios.filter(usuario => !usuario.ativo);
  }
  

  ngOnInit(): void {
    this.carregarUsuarios();
    console.log('📢 UsuariosComponent iniciado!');

  }

  carregarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe(
      (data) => {
        this.usuarios = data;
        this.filtrarUsuarios();
      },
      () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar usuários!' })
    );
  }

  abrirDialog(usuario?: Usuario): void {
    if (usuario) {
      this.usuarioSelecionado = { ...usuario };
      console.log("🟢 Editando usuário:", this.usuarioSelecionado);
    } else {
      this.usuarioSelecionado = this.novoUsuario();
      console.log("🔵 Criando novo usuário.");
    }
    this.exibirDialog = true;
  }

  visualizarUsuario(usuario: Usuario): void {
    this.usuarioSelecionado = { ...usuario };
    console.log("👀Visualizando usuário:", this.usuarioSelecionado);
    this.exibirDialog = true;
  }
  

  fecharDialog(): void {
    this.exibirDialog = false;
  }

  salvarUsuario(): void {
    if (this.usuarioSelecionado.id) {
      this.usuariosService.atualizarUsuario(this.usuarioSelecionado.id, this.usuarioSelecionado).subscribe(() => {
        this.carregarUsuarios();
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário atualizado com sucesso!' });
        this.fecharDialog();
      });
    } else {
      this.usuariosService.criarUsuario(this.usuarioSelecionado).subscribe(() => {
        this.carregarUsuarios();
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário criado com sucesso!' });
        this.fecharDialog();
      });
    }
  }

  confirmarExclusao(usuario: Usuario): void {
    this.usuariosService.deletarUsuario(usuario.id).subscribe(
      () => {
        console.log("✅ Usuário excluído:", usuario);
        this.carregarUsuarios();
      },
      (error) => {
        console.error("❌ Erro ao excluir usuário:", error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Erro ao excluir usuário!'
        });
      }
    );
  }
  

  novoUsuario(): Usuario {
    return { id: 0, nome: '', email: '', senha: '', perfil: 'USUARIO', ativo: true, dataCriacao: new Date(), ultimoLogin: new Date() };
  }



  desativarUsuario(usuario: Usuario): void {
    usuario.ativo = false; // Definimos como desativado
    this.usuariosService.atualizarUsuario(usuario.id, usuario).subscribe(
      () => {
        console.log("🔴 Usuário desativado:", usuario);
        this.carregarUsuarios();
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário desativado!' });
      },
      (error) => {
        console.error("❌ Erro ao desativar usuário:", error);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao desativar usuário!' });
      }
    );
  }
  



}


