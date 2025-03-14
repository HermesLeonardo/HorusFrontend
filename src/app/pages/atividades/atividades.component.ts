import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AtividadesService } from '../../core/services/atividades.service';
import { Usuario } from '../../core/model/usuario.model';
import { Atividade } from '../../core/model/atividade.model';
import { Projeto } from '../../core/model/projeto.model';
import { UsuariosService } from '../../core/services/usuarios.service';
import { ProjetosService } from '../../core/services/projetos.service';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../core/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-atividades',
  templateUrl: './atividades.component.html',
  styleUrls: ['./atividades.component.scss'],
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
    CardModule
  ],
  standalone: true
})
export class AtividadesComponent implements OnInit {
  atividades: Atividade[] = [];
  atividadesFiltradas: Atividade[] = [];
  atividadeSelecionada: Atividade = this.novaAtividade();
  exibirDialog: boolean = false;
  exibirVisualizacao: boolean = false; // 🔹 Estado para modal de visualização
  filtro = { nome: '', projeto: null };
  projetos: Projeto[] = [];
  usuarios: Usuario[] = [];
  modoEdicao: boolean = false;
  usuariosResponsaveis: { label: string, value: number }[] = [];

  userRole: string = '';


  constructor(
    private atividadesService: AtividadesService,
    private projetosService: ProjetosService,
    private usuariosService: UsuariosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.carregarAtividades();
    this.carregarProjetos();
  }

  filtrarAtividades(): void {
    this.atividadesFiltradas = this.atividades.filter(atividade =>
      (this.filtro.nome ? atividade.nome.toLowerCase().includes(this.filtro.nome.toLowerCase()) : true) &&
      (this.filtro.projeto ? atividade.id_projeto === this.filtro.projeto : true)
    );
  }



  carregarAtividades(): void {
    if (this.authService.getUserRole() === 'ROLE_ADMIN') {
      this.atividadesService.getAtividades().subscribe(
        (data) => {
          console.log("📥 Atividades recebidas (ADMIN):", data);
          this.atividades = data;
          this.filtrarAtividades();
          this.aplicarFiltroAtivo(); 
        },
        (error) => {
          console.error("❌ Erro ao carregar atividades!", error);
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar atividades!' });
        }
      );
    } else {
      this.atividadesService.getAtividadesUsuario().subscribe(
        (data) => {
          console.log("📥 Atividades recebidas (USUÁRIO):", data);
          this.atividades = data;
          this.filtrarAtividades();
        },
        (error) => {
          console.error("❌ Erro ao carregar atividades para usuário!", error);
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar atividades!' });
        }
      );
    }
  }



  carregarProjetos(): void {
    this.projetosService.getProjetos().subscribe(
      (data) => this.projetos = data
    );
  }

  carregarUsuarios(projetoId: number): void {
    if (!projetoId) {
      this.usuarios = [];
      return;
    }
    this.usuariosService.getUsuariosPorProjeto(projetoId).subscribe(
      (data) => this.usuarios = data,
      () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar usuários!' })
    );
  }

  abrirDialog(atividade?: Atividade): void {
    if (atividade) {
      console.log("✏️ Modo edição ativado");
      this.modoEdicao = true;

      this.atividadeSelecionada = {
        ...atividade,
        id_projeto: atividade.projeto ? atividade.projeto.id : null,
        dataInicio: atividade.dataInicio
          ? (typeof atividade.dataInicio === 'string'
            ? new Date(atividade.dataInicio)
            : atividade.dataInicio)
          : null,
        dataFim: atividade.dataFim
          ? (typeof atividade.dataFim === 'string'
            ? new Date(atividade.dataFim)
            : atividade.dataFim)
          : null,
        projeto: atividade.projeto || { id: null, nome: "Não definido" }
      };
    } else {
      console.log("➕ Criando nova atividade");
      this.modoEdicao = false;
      this.atividadeSelecionada = this.novaAtividade();
    }

    console.log("📌 Atividade Selecionada após ajuste:", this.atividadeSelecionada);
    this.exibirDialog = true;
  }


  abrirVisualizacao(atividade: Atividade): void {
    if (atividade) {
      this.atividadeSelecionada = Object.assign({}, atividade, {
        dataInicio: atividade.dataInicio ? new Date(atividade.dataInicio) : null,
        dataFim: atividade.dataFim ? new Date(atividade.dataFim) : null,
        usuariosResponsaveis: [], // Inicialmente vazio, depois será preenchido
        id_projeto: atividade.projeto ? atividade.projeto.id : null,
        projeto: atividade.projeto || { id: null, nome: "Não definido" }
      });

      console.log("Antes da busca:", this.atividadeSelecionada.usuariosResponsaveis);

      this.exibirVisualizacao = true; // 🔹 Garante que o modal seja ativado antes da requisição

      this.atividadesService.getUsuariosDaAtividade(atividade.id).subscribe(
        (usuarios) => {
          console.log("Usuários recebidos:", usuarios);

          if (usuarios && usuarios.length > 0) {
            this.atividadeSelecionada.usuariosResponsaveis = usuarios.map(user => ({
              id: user.id,
              nome: user.nome,
              email: user.email
            }));

            console.log("Depois da atribuição:", this.atividadeSelecionada.usuariosResponsaveis);

            // 🔹 Atualiza a interface após a atualização da variável
            this.cdRef.detectChanges();
          } else {
            console.warn("Nenhum usuário encontrado para essa atividade.");
          }
        },
        (error) => {
          console.error("❌ Erro ao carregar usuários responsáveis:", error);
        }
      );
    }
  }





  getNomeProjeto(idProjeto?: number): string {
    if (!idProjeto || !this.projetos?.length) {
      return 'Não definido';
    }

    const projeto = this.projetos.find(p => p.id === idProjeto);
    return projeto ? projeto.nome : 'Projeto não encontrado';
  }



  fecharDialog(): void {
    this.exibirDialog = false;
  }

  fecharVisualizacao(): void {
    this.exibirVisualizacao = false;
  }


  salvarAtividade(): void {
    console.log("🚀 Enviando atividade para " + (this.modoEdicao ? "atualização" : "criação") + ":", this.atividadeSelecionada);

    if (this.atividadeSelecionada.usuariosResponsaveis) {
      console.log("📌 Usuários Responsáveis antes do mapeamento:", this.atividadeSelecionada.usuariosResponsaveis);

      // Mapeia corretamente os IDs
      this.atividadeSelecionada.usuariosIds = this.atividadeSelecionada.usuariosResponsaveis
        .map(user => typeof user === 'number' ? user : user.id)
        .filter(id => id !== undefined && id !== null);

      console.log("✅ Usuários vinculados antes do envio:", this.atividadeSelecionada.usuariosIds);
    } else {
      this.atividadeSelecionada.usuariosIds = [];
    }

    if (this.modoEdicao) {
      this.atividadesService.atualizarAtividade(this.atividadeSelecionada.id, this.atividadeSelecionada).subscribe(
        (atividadeAtualizada) => {
          console.log("✅ Atividade atualizada no backend:", atividadeAtualizada);
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Atividade atualizada com sucesso!' });
          this.carregarAtividades();
          this.fecharDialog();
        },
        error => {
          console.error("❌ Erro ao atualizar atividade:", error);
        }
      );
    } else {
      this.atividadesService.criarAtividade(this.atividadeSelecionada).subscribe(
        (novaAtividade) => {
          console.log("✅ Atividade criada no backend:", novaAtividade);
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Atividade criada com sucesso!' });
          this.carregarAtividades();
          this.fecharDialog();
        },
        error => {
          console.error("❌ Erro ao criar atividade:", error);
        }
      );
    }
  }



  desativarAtividade(atividade: Atividade): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja desativar a atividade "${atividade.nome}"?`,
      accept: () => {
        this.atividadesService.desativarAtividade(atividade.id).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Atividade desativada com sucesso!' });
          this.carregarAtividades();
        }, error => {
          console.error("❌ Erro ao desativar atividade:", error);
        });

      }
    });
  }



  novaAtividade(): Atividade {
    return {
      id: 0,
      id_projeto: 0,
      projeto: { id: 0, nome: '' },  // ✅ Adicionando um projeto vazio para evitar o erro
      nome: '',
      descricao: '',
      dataInicio: new Date(),
      dataFim: new Date(),
      status: 'ABERTA',
      usuariosIds: [],
      ativo: true
    };

  }

  resetarFiltros(): void {
    this.filtro = { nome: '', projeto: null };
    this.filtrarAtividades();
  }

  getNomeUsuarioResponsavel(id_usuario_responsavel?: number): string {
    if (!id_usuario_responsavel || !this.usuarios?.length) {
      return 'Não definido';
    }
    return this.usuarios.find(u => u.id === id_usuario_responsavel)?.nome || 'Não definido';
  }

  onProjetoSelecionado(projetoSelecionado: any) {
    if (!projetoSelecionado || !projetoSelecionado.id) {
      console.warn("⚠ ID do projeto inválido:", projetoSelecionado);
      return;
    }

    const projetoId = projetoSelecionado.id;
    console.log("🔄 Projeto selecionado ID:", projetoId);

    this.projetosService.getUsuariosPorProjeto(projetoId).subscribe({
      next: (usuarios) => {
        console.log("✅ Usuários carregados:", usuarios);

        this.usuariosResponsaveis = usuarios.map(user => ({
          label: user.nome,
          value: user.id
        }));

        if (!this.modoEdicao) {
          this.atividadeSelecionada.usuariosResponsaveis = [];
        } else {
          const idsSelecionados = this.atividadeSelecionada.usuariosResponsaveis?.map(user => user.id) || [];
          this.atividadeSelecionada.usuariosResponsaveis = usuarios.filter(user =>
            idsSelecionados.includes(user.id));
        }

        console.log("✅ Usuários pré-selecionados:", this.atividadeSelecionada.usuariosResponsaveis);
      },
      error: (err) => {
        console.error("❌ Erro ao carregar usuários do projeto", err);
        this.usuariosResponsaveis = [];
      }
    });
  }



  atualizarUsuariosSelecionados(event: any): void {
    console.log("🔄 Atualizando usuários selecionados:", event.value);

    // Como o MultiSelect já fornece apenas IDs, basta atribuir diretamente
    this.atividadeSelecionada.usuariosResponsaveis = [...event.value];

    console.log("✅ Usuários selecionados atualizados:", this.atividadeSelecionada.usuariosResponsaveis);
  }



  filtroAtivo: boolean = true; // Por padrão, exibe atividades ativas

  toggleAtividadesDesativadas(): void {
    this.filtroAtivo = !this.filtroAtivo;
    this.aplicarFiltroAtivo();
  }

  aplicarFiltroAtivo(): void {
    this.atividadesFiltradas = this.atividades.filter(atividade =>
      this.filtroAtivo ? atividade.ativo === true : atividade.ativo === false
    );
  }





}
