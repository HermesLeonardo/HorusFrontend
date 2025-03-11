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
  exibirVisualizacao: any;

  usuarioVisualizacao: Usuario | null = null;


  constructor(
    private usuariosService: UsuariosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService // 🔹 Adicionando corretamente
  ) { console.log('🚀 UsuariosComponent CONSTRUTOR chamado!'); }


  filtrarUsuarios(): void {
    this.usuariosFiltrados = this.usuarios.filter(usuario =>
      (this.filtro.nome ? usuario.nome.toLowerCase().includes(this.filtro.nome.toLowerCase()) : true) &&
      (this.filtro.perfil ? usuario.perfil === this.filtro.perfil : true) &&
      (this.filtroAtivo ? usuario.ativo === true : usuario.ativo === false) // Ajuste correto
    );
  }
  
  

  resetarFiltros(): void {
    this.filtro = { nome: '', perfil: null };
    this.filtrarUsuarios(); // Atualiza a tabela com a lista original sem filtros
  }

  mostrarUsuariosDesativados(): void {
    this.filtroAtivo = false;
    this.aplicarFiltroAtivo();
  }
  
  mostrarUsuariosAtivos(): void {
    this.filtroAtivo = true;
    this.aplicarFiltroAtivo();
  }
  toggleUsuariosDesativados(): void {
    this.filtroAtivo = !this.filtroAtivo;
    this.aplicarFiltroAtivo();
  }
  
  


  ngOnInit(): void {
    this.carregarUsuarios();
    console.log('📢 UsuariosComponent iniciado!');

  }

  carregarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe(
      (data) => {
        this.usuarios = data;
        this.aplicarFiltroAtivo(); // Novo método que iremos criar
      },
      () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar usuários!' })
    );
  }
  filtroAtivo: boolean = true;  // por padrão exibe usuários ativos

  aplicarFiltroAtivo(): void {
    this.usuariosFiltrados = this.usuarios.filter(usuario =>
      this.filtroAtivo ? usuario.ativo === true : usuario.ativo === false
    );
  }
  



  // Novo método criado
  filtrarUsuariosAtivos(): void {
    this.usuariosFiltrados = this.usuarios.filter(usuario => usuario.ativo);
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
    this.usuarioVisualizacao = { ...usuario };
    console.log("👀 Visualizando usuário:", this.usuarioVisualizacao);
    this.exibirVisualizacao = true; // Agora abre o modal correto!
  }

  fecharVisualizacao(): void {
    this.exibirVisualizacao = false;
    this.usuarioVisualizacao = null;
  }


  fecharDialog(): void {
    this.exibirDialog = false;
  }
  salvarUsuario(): void {
    const usuarioFormatado: Usuario = {
      id: this.usuarioSelecionado.id || 0,
      nome: this.usuarioSelecionado.nome,
      email: this.usuarioSelecionado.email,
      senha: this.usuarioSelecionado.senha ? this.usuarioSelecionado.senha : "senha123", // Garante que a senha não seja nula
      perfil: typeof this.usuarioSelecionado.perfil === 'object' ? this.usuarioSelecionado.perfil.value : this.usuarioSelecionado.perfil, // 🛠️ Corrige o perfil para string
      ativo: true,
      dataCriacao: new Date(),
      ultimoLogin: new Date()
    };

    console.log("📤 JSON Enviado para API:", usuarioFormatado); // 🔍 Debugging

    this.usuariosService.criarUsuario(usuarioFormatado).subscribe(() => {
      this.carregarUsuarios();
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário criado com sucesso!' });
      this.fecharDialog();
    });
  }


  confirmarExclusao(usuario: Usuario): void {
    this.usuariosService.verificarVinculacoes(usuario.id).subscribe((temVinculacoes) => {
      if (temVinculacoes) {
        this.confirmationService.confirm({
          message: `O usuário ${usuario.nome} tem vinculações com o sistema e não pode ser excluído diretamente. Deseja desativá-lo?`,
          acceptLabel: "Sim, desativar",
          rejectLabel: "Cancelar",
          accept: () => {
            usuario.ativo = false;
            this.usuariosService.atualizarUsuario(usuario.id, usuario).subscribe(() => {
              this.carregarUsuarios();
              this.messageService.add({
                severity: 'info',
                summary: 'Usuário desativado',
                detail: 'O usuário foi desativado com sucesso.'
              });
            });
          }
        });
      } else {
        this.confirmationService.confirm({
          message: `Tem certeza que deseja excluir ${usuario.nome}? Esta ação não pode ser desfeita!`,
          acceptLabel: "Sim, excluir",
          rejectLabel: "Cancelar",
          accept: () => {
            this.usuariosService.deletarUsuario(usuario.id).subscribe({
              next: () => {
                this.carregarUsuarios();
                this.messageService.add({
                  severity: 'success',
                  summary: 'Sucesso',
                  detail: 'Usuário excluído com sucesso!'
                });
              },
              error: () => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Erro',
                  detail: 'Não foi possível excluir o usuário!'
                });
              }
            });
          }
        });
      }
    });
  }


  novoUsuario(): Usuario {
    return { id: 0, nome: '', email: '', senha: '', perfil: 'USUARIO', ativo: true, dataCriacao: new Date(), ultimoLogin: new Date() };
  }



  // Desativar usuário
  desativarUsuario(usuario: Usuario): void {
    this.confirmationService.confirm({
      message: `Deseja desativar o usuário ${usuario.nome}?`,
      acceptLabel: "Sim",
      rejectLabel: "Cancelar",
      accept: () => {
        usuario.ativo = false;
        this.usuariosService.atualizarUsuario(usuario.id, usuario).subscribe(() => {
          this.carregarUsuarios(); // Isso já carregará somente ativos agora
          this.messageService.add({
            severity: 'info',
            summary: 'Usuário desativado',
            detail: 'O usuário foi desativado com sucesso!'
          });
        });
      }
    });
  }

  // Reativar usuário
  reativarUsuario(usuario: Usuario): void {
    usuario.ativo = true;
    this.usuariosService.atualizarUsuario(usuario.id, usuario).subscribe(
      () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário reativado com sucesso!' });
        this.carregarUsuarios(); // recarrega e atualiza a tabela
      },
      () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao reativar usuário.' });
      }
    );
  }
  


  mostrarPopupErro(mensagemErro: string, usuario: Usuario): void {
    if (!this.confirmationService) {
      console.error("❌ Erro: ConfirmationService não está definido.");
      return;
    }

    this.confirmationService.confirm({
      message: `${mensagemErro} Deseja desativar o usuário em vez de excluir?`,
      acceptLabel: "Desativar Usuário",
      rejectLabel: "Cancelar",
      accept: () => {
        this.desativarUsuario(usuario);
      }
    });
  }






}


