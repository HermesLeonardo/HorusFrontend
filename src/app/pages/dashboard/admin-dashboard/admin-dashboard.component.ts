import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
import { ProjetosService } from '../../../core/services/projetos.service';
import { AtividadesService } from '../../../core/services/atividades.service';
import { UsuariosService } from '../../../core/services/usuarios.service';

import { registerables } from 'chart.js';
Chart.register(...registerables);


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
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

  constructor(
    private projetosService: ProjetosService,
    private atividadesService: AtividadesService,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
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
    // Contadores para Projetos e Atividades
    const statusProjetosCount: { [key: string]: number } = {
      PLANEJADO: 0,
      EM_ANDAMENTO: 0,
      CONCLUIDO: 0,
      CANCELADO: 0
    };
  
    const statusAtividadesCount: { [key: string]: number } = {
      ABERTA: 0,
      EM_ANDAMENTO: 0,
      CONCLUIDA: 0,
      PAUSADA: 0
    };
  
    // Contabilizando os status de projetos
    projetos.forEach(projeto => {
      if (statusProjetosCount[projeto.status] !== undefined) {
        statusProjetosCount[projeto.status]++;
      }
    });
  
    // Contabilizando os status de atividades
    atividades.forEach(atividade => {
      if (statusAtividadesCount[atividade.status] !== undefined) {
        statusAtividadesCount[atividade.status]++;
      }
    });
  
    // 🔹 Criando os dados para o gráfico duplo
    this.statusProjetosData = {
      labels: ['Planejado/Aberta', 'Em Andamento', 'Concluído/Concluída', 'Cancelado/Pausada'],
      datasets: [
        {
          label: 'Projetos',
          data: [
            statusProjetosCount['PLANEJADO'],
            statusProjetosCount['EM_ANDAMENTO'],
            statusProjetosCount['CONCLUIDO'],
            statusProjetosCount['CANCELADO']
          ],
          backgroundColor: '#3498db'
        },
        {
          label: 'Atividades',
          data: [
            statusAtividadesCount['ABERTA'],
            statusAtividadesCount['EM_ANDAMENTO'],
            statusAtividadesCount['CONCLUIDA'],
            statusAtividadesCount['PAUSADA']
          ],
          backgroundColor: '#2ecc71'
        }
      ]
    };
  
    this.renderizarGrafico();
  }
  
  

  // 🔹 Processa os status dos projetos para o gráfico
  private processarStatusProjetos(projetos: any[]): void {
    const statusCount: { [key: string]: number } = {
      PLANEJADO: 0,
      EM_ANDAMENTO: 0,
      CONCLUIDO: 0,
      CANCELADO: 0
    };
  
    projetos.forEach(projeto => {
      const status = projeto.status as keyof typeof statusCount; // Converte para um tipo válido
      if (statusCount[status] !== undefined) {
        statusCount[status]++;
      }
    });
  
    this.statusProjetosData = {
      labels: ['Planejado', 'Em Andamento', 'Concluído', 'Cancelado'],
      datasets: [
        {
          data: Object.values(statusCount),
          backgroundColor: ['#f39c12', '#3498db', '#2ecc71', '#e74c3c']
        }
      ]
    };
  
    this.renderizarGrafico();
  }
  

  // 🔹 Renderiza o gráfico de status dos projetos
  private renderizarGrafico(): void {
    setTimeout(() => {
      const canvas = document.getElementById('projetosChart') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
  
        if (ctx) {
          new Chart(ctx, {
            type: 'bar',
            data: this.statusProjetosData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  ticks: {
                    color: '#fff'
                  }
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    color: '#fff'
                  }
                }
              },
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    color: '#fff'
                  }
                }
              }
            }
          });
        }
      }
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
