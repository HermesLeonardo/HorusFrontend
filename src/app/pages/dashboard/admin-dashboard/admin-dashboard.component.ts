import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';


import { ProjetosService } from '../../../core/services/projetos.service';
import { Projeto } from '../../../core/model/projeto.model';

import { AtividadesService } from '../../../core/services/atividades.service';
import { Atividade } from '../../../core/model/atividade.model';

import { UsuariosService } from '../../../core/services/usuarios.service';
import { Usuario } from '../../../core/model/usuario.model';





import { registerables } from 'chart.js';
Chart.register(...registerables);


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  providers: [MessageService, ConfirmationService],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    MultiSelectModule
  ]
})
export class AdminDashboardComponent implements OnInit {
  // 🔹 Variáveis para armazenar os dados do dashboard
  totalProjetos: number = 0;
  totalAtividades: number = 0;
  totalHorasLancadas: number = 0;
  totalUsuarios: number = 0;

  // 🔹 Arrays para armazenar listas de dados
  projetosRecentes: any[] = [];
  atividadesPendentes: any[] = [];
  ultimosLogins: any[] = [];

  // 🔹 Variável para armazenar os dados do gráfico
  statusProjetosData: any = {};
  tipoGrafico: ChartType = 'bar'; // Alterna entre 'bar', 'pie' e 'polarArea'

  // 🔹 Variáveis para armazenar os filtros
  filtroPeriodo: string = 'todos';
  statusProjetos: string[] = ['PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'];
  statusAtividades: string[] = ['ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'PAUSADA'];
  statusSelecionadosProjetos: { [key: string]: boolean } = {};
  statusSelecionadosAtividades: { [key: string]: boolean } = {};

  constructor(
    private projetosService: ProjetosService,
    private atividadesService: AtividadesService,
    private usuariosService: UsuariosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.carregarDados();
    this.statusProjetos.forEach(status => this.statusSelecionadosProjetos[status] = true);
    this.statusAtividades.forEach(status => this.statusSelecionadosAtividades[status] = true);
  }

  private carregarDados(): void {
    this.projetosService.getProjetos().subscribe(projetos => {
      this.totalProjetos = projetos.length;
      this.projetosRecentes = projetos.slice(0, 5);

      this.atividadesService.getAtividades().subscribe(atividades => {
        this.totalAtividades = atividades.length;
        this.atividadesPendentes = atividades.filter(a => a.status !== 'CONCLUIDA').slice(0, 5);

        // Processa os dados do gráfico combinando Projetos e Atividades
        this.processarDadosParaGrafico(projetos, atividades);
      });
    });

    this.usuariosService.getUsuarios().subscribe(usuarios => {
      this.totalUsuarios = usuarios.length;
      this.ultimosLogins = usuarios
        .sort((a, b) => new Date(b.ultimoLogin).getTime() - new Date(a.ultimoLogin).getTime())
        .slice(0, 5);
    });
  }

  private processarDadosParaGrafico(projetos: any[], atividades: any[]): void {
    const statusProjetosCount: { [key: string]: number } = {
      PLANEJADO: 0, EM_ANDAMENTO: 0, CONCLUIDO: 0, CANCELADO: 0
    };

    const statusAtividadesCount: { [key: string]: number } = {
      ABERTA: 0, EM_ANDAMENTO: 0, CONCLUIDA: 0, PAUSADA: 0
    };

    // 🔹 Contabiliza apenas os projetos e atividades que estão nos filtros ativos
    projetos.forEach(projeto => {
      if (this.statusSelecionadosProjetos[projeto.status]) {
        statusProjetosCount[projeto.status]++;
      }
    });

    atividades.forEach(atividade => {
      if (this.statusSelecionadosAtividades[atividade.status]) {
        statusAtividadesCount[atividade.status]++;
      }
    });

    // 🔹 Verifica se pelo menos um filtro está ativo
    const algumProjetoAtivo = Object.values(this.statusSelecionadosProjetos).some(selected => selected);
    const algumaAtividadeAtiva = Object.values(this.statusSelecionadosAtividades).some(selected => selected);

    // 🔹 Se todos os status estiverem desmarcados, mantém um valor mínimo para não sumir o gráfico
    if (!algumProjetoAtivo && !algumaAtividadeAtiva) {
      console.warn("Nenhum filtro selecionado, adicionando valor mínimo para exibição do gráfico.");
      statusProjetosCount["PLANEJADO"] = 1;
      statusAtividadesCount["ABERTA"] = 1;
    }

    console.log("Dados do gráfico antes da atualização:", statusProjetosCount, statusAtividadesCount);
    this.statusProjetosData = {
      labels: ['Planejado/Aberta', 'Em Andamento', 'Concluído/Concluída', 'Cancelado/Pausada'],
      datasets: [
        {
          label: 'Projetos',
          data: ['PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO']
            .map(status => this.statusSelecionadosProjetos[status] ? statusProjetosCount[status] : 0),
          backgroundColor: ['#1E88E5', '#FFC107', '#4CAF50', '#F44336'], // Azul, Amarelo, Verde, Vermelho
          borderColor: '#fff', // Bordas brancas para destacar
          borderWidth: 2
        },
        {
          label: 'Atividades',
          data: ['ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'PAUSADA']
            .map(status => this.statusSelecionadosAtividades[status] ? statusAtividadesCount[status] : 0),
          backgroundColor: ['#29B6F6', '#FF9800', '#66BB6A', '#E53935'], // Azul Claro, Laranja, Verde Claro, Vermelho Escuro
          borderColor: '#fff',
          borderWidth: 2
        }
      ]
    };

    console.log("Dados do gráfico após atualização:", this.statusProjetosData);
    this.renderizarGrafico();
  }




  // 🔹 Alternar Tipo de Gráfico
  alternarTipoGrafico(): void {
    if (this.tipoGrafico === 'bar') {
      this.tipoGrafico = 'polarArea';
    } else {
      this.tipoGrafico = 'bar';
    }
    this.renderizarGrafico();
  }


  // 🔹 Atualizar Gráfico ao Mudar Filtros
  atualizarGrafico(valor: string): void {
    this.filtroPeriodo = valor;
    console.log("Filtro de período atualizado:", this.filtroPeriodo);

    // 🔹 Recarregar os dados ao atualizar o gráfico
    this.projetosService.getProjetos().subscribe(projetos => {
      this.atividadesService.getAtividades().subscribe(atividades => {
        this.processarDadosParaGrafico(projetos, atividades);
      });
    });
  }






  // 🔹 Renderiza o gráfico de status dos projetos
  private chartInstance: any; // 🔹 Variável para armazenar a instância do gráfico

  private renderizarGrafico(): void {
    setTimeout(() => {
      const canvas = document.getElementById('projetosChart') as HTMLCanvasElement;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 🔹 Destroi o gráfico antigo antes de criar um novo
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      console.log("Criando novo gráfico com os dados:", this.statusProjetosData);

      // 🔹 Cria um novo gráfico e armazena a instância
      this.chartInstance = new Chart(ctx, {
        type: this.tipoGrafico, // 'bar', 'pie' ou 'polarArea'
        data: this.statusProjetosData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: this.tipoGrafico === 'polarArea' ? {} : {
            x: { ticks: { color: '#fff' } },
            y: { beginAtZero: true, ticks: { stepSize: 1, color: '#fff' } }
          },
          plugins: {
            legend: { position: 'top', labels: { color: '#fff' } }
          }
        }
      });
    }, 500);
  }


  // 🔹 Métodos para os botões de ação rápida
  criarNovoProjeto(): void {
    console.log('Criando novo projeto...');
  }

  criarNovaAtividade(): void {
    console.log('Criando nova atividade...');
  }

  acessarRelatorios(): void {
    console.log('Acessando relatórios...');
  }

  gerenciarUsuarios(): void {
    console.log('Gerenciando usuários...');
  }



  //Seção de configuração para os modais


  abrirDialogProjeto(): void {
    this.projetoSelecionado = this.novoProjeto();
    this.carregarUsuarios();
    this.exibirDialogProjeto = true;
    console.log("🔹 Modal deve aparecer - exibirDialogProjeto =", this.exibirDialogProjeto);
  }
  
  

  fecharDialogProjeto(): void {
    this.exibirDialogProjeto = false;
  }


  // 🔹 Variáveis para o modal de criação de projetos
  exibirDialogProjeto: boolean = false;
  projetoSelecionado: Projeto = this.novoProjeto();
  usuariosOptions: { label: string; value: number }[] = [];
  usuarios: Usuario[] = [];

  statusOptions = [
    { label: 'Planejamento', value: 'PLANEJADO' },
    { label: 'Em andamento', value: 'EM_ANDAMENTO' },
    { label: 'Concluído', value: 'CONCLUIDO' },
    { label: 'Cancelado', value: 'CANCELADO' }
  ];

  prioridadeOptions = [
    { label: 'Alta', value: 'ALTA' },
    { label: 'Média', value: 'MEDIA' },
    { label: 'Baixa', value: 'BAIXA' }
  ];


  carregarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe(
      (usuarios) => {
        this.usuarios = usuarios;
        this.usuariosOptions = usuarios.map(user => ({
          label: user.nome,
          value: user.id
        }));
      },
      (error) => {
        console.error("❌ Erro ao carregar usuários:", error);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar usuários!' });
      }
    );
  }


  salvarProjeto(): void {
    if (!this.projetoSelecionado.nome) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'O nome do projeto é obrigatório!' });
      return;
    }

    const usuariosIds = this.projetoSelecionado.idUsuarioResponsavel || [];

    this.projetosService.salvarProjeto({
      projeto: {
        ...this.projetoSelecionado,
        status: typeof this.projetoSelecionado.status === 'object' ? this.projetoSelecionado.status.value : this.projetoSelecionado.status,
        prioridade: typeof this.projetoSelecionado.prioridade === 'object' ? this.projetoSelecionado.prioridade.value : this.projetoSelecionado.prioridade
      },
      usuariosIds: usuariosIds
    }).subscribe(
      () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Projeto criado com sucesso!' });
        this.fecharDialogProjeto();
      },
      (error) => {
        console.error("❌ Erro ao criar projeto:", error);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao criar projeto!' });
      }
    );
  }

  novoProjeto(): Projeto {
    return {
      projeto: null,
      id: 0,
      nome: '',
      descricao: '',
      status: 'PLANEJADO',
      prioridade: 'MEDIA',
      idUsuarioResponsavel: [],
      dataInicio: new Date(),
      dataFim: undefined
    };
  }





}
