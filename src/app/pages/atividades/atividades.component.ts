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

  constructor(
    private atividadesService: AtividadesService,
    private projetosService: ProjetosService,
    private usuariosService: UsuariosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
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
    this.atividadesService.getAtividades().subscribe(
      (data) => {
        this.atividades = data;
        this.filtrarAtividades();
      },
      () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar atividades!' })
    );
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
    this.atividadeSelecionada = atividade ? { ...atividade } : this.novaAtividade();
    this.exibirDialog = true;
  }

  abrirVisualizacao(atividade: Atividade): void {
    if (atividade) {
        this.atividadeSelecionada = { ...atividade };

        // Verifica se os projetos e usuários já foram carregados
        if (!this.projetos.length) {
            this.carregarProjetos();
        }
        if (!this.usuarios.length) {
            this.carregarUsuarios(atividade.id_projeto);
        }
        
        this.exibirVisualizacao = true;
    }
}

getNomeProjeto(idProjeto?: number): string {
  if (!idProjeto || !this.projetos?.length) {
    return 'Carregando...';
  }
  
  return this.projetos.find(p => p.id === idProjeto)?.nome || 'Não definido';
}


  fecharDialog(): void {
    this.exibirDialog = false;
  }

  fecharVisualizacao(): void {
    this.exibirVisualizacao = false;
  }

  salvarAtividade(): void {
    if (this.atividadeSelecionada.id) {
      this.atividadesService.atualizarAtividade(this.atividadeSelecionada.id, this.atividadeSelecionada).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Atividade atualizada com sucesso!' });
        this.carregarAtividades();
        this.fecharDialog();
      });
    } else {
      this.atividadesService.criarAtividade(this.atividadeSelecionada).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Atividade criada com sucesso!' });
        this.carregarAtividades();
        this.fecharDialog();
      });
    }
  }

  deletarAtividade(atividade: Atividade): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a atividade "${atividade.nome}"?`,
      accept: () => {
        this.atividadesService.deletarAtividade(atividade.id).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Atividade deletada com sucesso!' });
          this.carregarAtividades();
        });
      }
    });
  }

  novaAtividade(): Atividade {
    return {
      id: 0,
      id_projeto: 0,
      nome: '',
      descricao: '',
      data_inicio: new Date(),
      data_fim: new Date(),
      status: 'ABERTA'
    };
  }

  resetarFiltros(): void {
    this.filtro = { nome: '', projeto: null };
    this.filtrarAtividades();
  }

  getNomeUsuarioResponsavel(id_usuario_responsavel?: number): string {
    if (!id_usuario_responsavel) return 'Não definido';
    const usuario = this.usuarios.find(u => u.id === id_usuario_responsavel);
    return usuario ? usuario.nome : 'Não definido';
  }
}
