import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { forkJoin } from 'rxjs';


import { ProjetosService } from '../../../core/services/projetos.service';
import { Projeto } from '../../../core/model/projeto.model';

import { AtividadesService } from '../../../core/services/atividades.service';
import { Atividade } from '../../../core/model/atividade.model';

import { UsuariosService } from '../../../core/services/usuarios.service';
import { Usuario } from '../../../core/model/usuario.model';

import { LancamentoHorasService } from '../../../core/services/lancamento-horas.service';
import { LancamentoHoras } from '../../../core/model/lancamento-horas.model';

import { AuthService } from '../../../core/services/auth.service';


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
  userRole: string = '';

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

  userId: number = 0;


  constructor(
    private projetosService: ProjetosService,
    private atividadesService: AtividadesService,
    private usuariosService: UsuariosService,
    private lancamentoService: LancamentoHorasService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.carregarDados();
    this.statusProjetos.forEach(status => this.statusSelecionadosProjetos[status] = true);
    this.statusAtividades.forEach(status => this.statusSelecionadosAtividades[status] = true);

    this.userRole = this.authService.getUserRole() ?? 'ROLE_USER'; // Se for null, assume 'USUARIO'
    this.userId = this.authService.getUserId(); // Obtém o ID do usuário logado

    console.log("🔍 UserRole no Dashboard:", this.userRole);
    console.log("🔍 UserID no Dashboard:", this.userId);
  }

  private carregarDados(): void {
    this.userRole = this.authService.getUserRole()?.trim().toUpperCase() ?? 'ROLE_USER'; // Garantir que a role esteja formatada corretamente
    this.userId = this.authService.getUserId();

    const isAdmin = this.userRole === 'ROLE_ADMIN';

    console.log("🔍 UserRole no Dashboard:", this.userRole);
    console.log("🔍 UserID no Dashboard:", this.userId);

    forkJoin({
      projetos: this.projetosService.getProjetos(),
      atividades: this.atividadesService.getAtividades(),
      usuarios: this.usuariosService.getUsuarios(),
      lancamentos: this.lancamentoService.getLancamentos()
    }).subscribe({
      next: ({ projetos, atividades, usuarios, lancamentos }) => {
        // 🔹 Filtragem de Projetos
        this.totalProjetos = isAdmin ? projetos.length : projetos.filter(proj => {
          if (!proj.idUsuarioResponsavel) return false;
          return Array.isArray(proj.idUsuarioResponsavel)
            ? proj.idUsuarioResponsavel.includes(this.userId)
            : proj.idUsuarioResponsavel === this.userId;
        }).length;

        const projetosUsuario = isAdmin ? projetos : projetos.filter(proj => {
          if (!proj.idUsuarioResponsavel) return false;
          return Array.isArray(proj.idUsuarioResponsavel)
            ? proj.idUsuarioResponsavel.includes(this.userId)
            : proj.idUsuarioResponsavel === this.userId;
        });

        this.projetosRecentes = projetosUsuario.slice(0, 5).map(projeto => ({
          ...projeto,
          usuarioResponsavel: Array.isArray(projeto.idUsuarioResponsavel)
            ? usuarios.find(user => projeto.idUsuarioResponsavel?.includes(user.id))
            : usuarios.find(user => user.id === Number(projeto.idUsuarioResponsavel))
            || { nome: 'Não atribuído' }
        }));

        // 🔹 Filtragem de Atividades
        this.totalAtividades = isAdmin ? atividades.length : atividades.filter(ativ => {
          return Array.isArray(ativ.usuariosResponsaveis) && ativ.usuariosResponsaveis.some(user => user.id === this.userId);
        }).length;

        const atividadesUsuario = isAdmin ? atividades : atividades.filter(ativ => {
          return Array.isArray(ativ.usuariosResponsaveis) && ativ.usuariosResponsaveis.some(user => user.id === this.userId);
        });

        this.atividadesPendentes = atividadesUsuario.filter(a => a.status !== 'CONCLUIDA').slice(0, 5);

        // 🔹 Processamento de Lançamentos de Horas
        const lancamentosUsuario = isAdmin ? lancamentos : lancamentos.filter(lanc => lanc.idUsuario === this.userId);
        this.totalHorasLancadas = lancamentosUsuario.reduce((total, lanc) => {
          const horaInicio = new Date(`1970-01-01T${lanc.horaInicio}:00`);
          const horaFim = new Date(`1970-01-01T${lanc.horaFim}:00`);
          const diferencaHoras = (horaFim.getTime() - horaInicio.getTime()) / (1000 * 60 * 60);
          return total + (diferencaHoras > 0 ? diferencaHoras : 0);
        }, 0);

        // 🔹 Processamento de Usuários
        this.totalUsuarios = isAdmin ? usuarios.length : 0;
        this.ultimosLogins = isAdmin ? usuarios.sort((a, b) =>
          new Date(b.ultimoLogin).getTime() - new Date(a.ultimoLogin).getTime()).slice(0, 5)
          : [];

        // 🔹 Atualiza os dados do gráfico após carregar tudo
        this.processarDadosParaGrafico(projetosUsuario, atividadesUsuario);

        console.log("📌 Dados carregados:", {
          totalProjetos: this.totalProjetos,
          totalAtividades: this.totalAtividades,
          totalHorasLancadas: this.totalHorasLancadas,
          totalUsuarios: this.totalUsuarios,
          projetosRecentes: this.projetosRecentes,
          atividadesPendentes: this.atividadesPendentes,
          ultimosLogins: this.ultimosLogins
        });
      },
      error: (err) => {
        console.error("❌ Erro ao carregar dados:", err);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar dados do dashboard' });
      }
    });
  }



  private processarDadosParaGrafico(projetos: any[], atividades: any[]): void {
    const statusProjetosCount: { [key: string]: number } = {
      PLANEJADO: 0, EM_ANDAMENTO: 0, CONCLUIDO: 0, CANCELADO: 0
    };

    const statusAtividadesCount: { [key: string]: number } = {
      ABERTA: 0, EM_ANDAMENTO: 0, CONCLUIDA: 0, PAUSADA: 0
    };

    console.log("🔍 Processando dados para gráfico...");
    console.log("👤 Role do usuário:", this.userRole);
    console.log("🆔 ID do usuário:", this.userId);

    // 🔹 Contabiliza projetos baseado na role do usuário
    projetos.forEach(projeto => {
      if (this.userRole === 'ROLE_ADMIN' || (
        Array.isArray(projeto.idUsuarioResponsavel)
          ? projeto.idUsuarioResponsavel.includes(this.userId)
          : projeto.idUsuarioResponsavel === this.userId
      )) {
        if (this.statusSelecionadosProjetos[projeto.status]) {
          statusProjetosCount[projeto.status]++;
        }
      }
    });

    // 🔹 Contabiliza atividades baseado na role do usuário
    atividades.forEach(atividade => {
      if (
        this.userRole === 'ROLE_ADMIN' || (
          Array.isArray(atividade.usuariosResponsaveis)
            ? atividade.usuariosResponsaveis.some((user: Usuario) => user.id === this.userId)
            : false
        )
      ) {
        if (this.statusSelecionadosAtividades[atividade.status]) {
          statusAtividadesCount[atividade.status]++;
        }
      }
    });
    

    // 🔹 Verifica se pelo menos um filtro está ativo
    const algumProjetoAtivo = Object.values(this.statusSelecionadosProjetos).some(selected => selected);
    const algumaAtividadeAtiva = Object.values(this.statusSelecionadosAtividades).some(selected => selected);

    // 🔹 Se todos os status estiverem desmarcados, mantém um valor mínimo para não sumir o gráfico
    if (!algumProjetoAtivo && !algumaAtividadeAtiva) {
      console.warn("⚠️ Nenhum filtro selecionado, adicionando valores padrão.");
      statusProjetosCount["PLANEJADO"] = 1;
      statusAtividadesCount["ABERTA"] = 1;
    }

    console.log("📊 Contagem de Status Projetos:", statusProjetosCount);
    console.log("📊 Contagem de Status Atividades:", statusAtividadesCount);

    // 🔹 Atualiza os dados do gráfico
    this.statusProjetosData = {
      labels: ['Planejado/Aberta', 'Em Andamento', 'Concluído/Concluída', 'Cancelado/Pausada'],
      datasets: [
        {
          label: 'Projetos',
          data: ['PLANEJADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO']
            .map(status => this.statusSelecionadosProjetos[status] ? statusProjetosCount[status] : 0),
          backgroundColor: ['#1E88E5', '#FFC107', '#4CAF50', '#F44336'], // Azul, Amarelo, Verde, Vermelho
          borderColor: '#fff',
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

    console.log("📈 Dados do gráfico atualizados:", this.statusProjetosData);
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
