import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
import { ProjetosService } from '../../../core/services/projetos.service';
import { AtividadesService } from '../../../core/services/atividades.service';
import { UsuariosService } from '../../../core/services/usuarios.service';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';



import { registerables } from 'chart.js';
Chart.register(...registerables);


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
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
    private usuariosService: UsuariosService
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
}
