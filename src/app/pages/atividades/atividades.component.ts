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
  exibirVisualizacao: boolean = false; 
  filtro: { nome: string, projeto: { id: number, nome: string } | null } = { nome: '', projeto: null };
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
    console.log("🔍 Aplicando filtro...");
    console.log("➡️ Filtro Nome:", this.filtro.nome);
    console.log("➡️ Filtro Projeto:", this.filtro.projeto);
    console.log("➡️ Filtro Projeto ID:", this.filtro.projeto?.id);
  
    this.atividadesFiltradas = this.atividades.filter(atividade => {
      // 🔹 Força um ID para atividades sem projeto
      const idProjetoAtividade = atividade.projeto && atividade.projeto.id ? atividade.projeto.id : 0;
      console.log("🆔 ID do Projeto da Atividade (ajustado):", idProjetoAtividade);
  
      const nomeMatch = this.filtro.nome
        ? atividade.nome.toLowerCase().includes(this.filtro.nome.toLowerCase())
        : true;
  
      const projetoMatch = this.filtro.projeto && this.filtro.projeto.id
        ? idProjetoAtividade === this.filtro.projeto.id
        : true;
  
      // 🔍 Logs para cada atividade processada
      console.log("-----------------------------------");
      console.log("🎯 Atividade: ", atividade.nome);
      console.log("✅ Nome corresponde?", nomeMatch);
      console.log("✅ Projeto corresponde?", projetoMatch);
      console.log("🔎 Resultado Final:", nomeMatch && projetoMatch);
      
      return nomeMatch && projetoMatch;
    });
  
    console.log("✅ Atividades Filtradas:", this.atividadesFiltradas);
  }
  

  reativarAtividade(atividade: Atividade): void {
    this.confirmationService.confirm({
      message: `Deseja reativar a atividade "${atividade.nome}"?`,
      accept: () => {
        this.atividadesService.reativarAtividade(atividade.id).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Atividade reativada com sucesso!' });
          this.carregarAtividades(); // 🔄 Atualiza a lista após a reativação
        }, error => {
          console.error("❌ Erro ao reativar atividade:", error);
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao reativar atividade!' });
        });
      }
    });
  }


  carregarAtividades(): void {
    if (this.authService.getUserRole() === 'ROLE_ADMIN') {
      this.atividadesService.getAtividades().subscribe(
        (data) => {
          console.log("📥 Atividades recebidas (ADMIN):", data); // <-- Adicione este console.log
          this.atividades = data;
          this.filtrarAtividades();
          this.aplicarFiltroAtivo();
        },
        (error) => {
          console.error("❌ Erro ao carregar atividades!", error);
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
      this.atividadeSelecionada = {
        ...atividade,
        dataInicio: atividade.dataInicio ? new Date(atividade.dataInicio) : null,
        dataFim: atividade.dataFim ? new Date(atividade.dataFim) : null,
        usuariosResponsaveis: [],
        id_projeto: atividade.projeto?.id ?? null,
        projeto: atividade.projeto ?? { id: null, nome: "Não definido" } // <-- Garante que sempre tenha um objeto
      };
  
      console.log("🧐 Atividade Selecionada para Visualização:", this.atividadeSelecionada);
  
      this.exibirVisualizacao = true;
  
      this.atividadesService.getUsuariosDaAtividade(atividade.id).subscribe(
        (usuarios) => {
          this.atividadeSelecionada.usuariosResponsaveis = usuarios.map(user => ({
            id: user.id,
            nome: user.nome,
            email: user.email
          }));
          this.cdRef.detectChanges();
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

  getNomeUsuarioResponsavel(atividade: Atividade): string {
    if (!atividade || !atividade.usuariosResponsaveis) {
        console.warn("⚠ Nenhum usuário encontrado para a atividade:", atividade);
        return "Não definido";
    }

    if (atividade.usuariosResponsaveis.length > 0) {
        console.log("✅ Responsáveis encontrados:", atividade.usuariosResponsaveis);
        return atividade.usuariosResponsaveis[0].nome || "Não definido";
    }

    return "Não definido";
}

  

  onProjetoSelecionado(event: any): void {
    if (event && event.value) {
      console.log("🔄 Projeto selecionado:", event.value);
      this.filtro.projeto = this.projetos.find(proj => proj.id === event.value.id) || null;
      this.filtrarAtividades(); // Aplica o filtro imediatamente após a seleção
    } else {
      this.filtro.projeto = null;
      this.filtrarAtividades();
    }
    this.cdRef.detectChanges();
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
