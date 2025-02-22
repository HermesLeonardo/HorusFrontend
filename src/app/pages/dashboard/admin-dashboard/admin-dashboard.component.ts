import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjetosService } from '../../../core/services/projetos.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { Projeto } from '../../../core/model/projeto.model';
import { Usuario } from '../../../core/model/usuario.model';
import { Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ToastModule],
  providers: [MessageService],
  encapsulation: ViewEncapsulation.Emulated

})
export class AdminDashboardComponent implements OnInit {
  projetos: Projeto[] = [];
  projetosPaginados: Projeto[][] = [];
  projetoSelecionado: Projeto | null = null;
  projetoDialogVisivel: boolean = false;
  stepIndex: number = 0;
  senhaConfirmacao: string = '';


  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  usuariosPrioridadeAlta: Usuario[] = [];
  usuarioSelecionado: Usuario | null = null;

  atividadesAbertas: any[] = [];
  atividadesEmAndamento: any[] = [];
  atividadesConcluidas: any[] = [];
  atividadesPausadas: any[] = [];
  atividadesSelecionadas: any[] = [];

  statusAtividadeSelecionado: string = '';
  filtroUsuario: string = '';
  isCollapsed: any;


  constructor(
    private projetosService: ProjetosService,
    private usuariosService: UsuariosService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.carregarProjetos();
    this.carregarUsuarios();

    this.carregarUsuariosLogins();
  }


  /*===== COMEÇO: CONFIG PARA USUÁRIOS =====*/

  carregarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe(
      (data) => {
        this.usuarios = data;
        this.usuariosFiltrados = [...this.usuarios];
      },
      (error) => console.error('Erro ao carregar usuários', error)
    );
  }

  abrirUsuario(usuario: Usuario): void {
    this.usuarioSelecionado = usuario;
  }

  abrirAtividades(status: string): void {
    this.statusAtividadeSelecionado = status;
    switch (status) {
      case 'ABERTA':
        this.atividadesSelecionadas = this.atividadesAbertas;
        break;
      case 'EM_ANDAMENTO':
        this.atividadesSelecionadas = this.atividadesEmAndamento;
        break;
      case 'CONCLUIDA':
        this.atividadesSelecionadas = this.atividadesConcluidas;
        break;
      case 'PAUSADA':
        this.atividadesSelecionadas = this.atividadesPausadas;
        break;
    }
  }

  fecharModal(): void {
    this.projetoSelecionado = null;
    this.usuarioSelecionado = null;
    this.atividadesSelecionadas = [];
  }

  identificarUsuariosComPrioridadeAlta(): void {
    this.usuariosPrioridadeAlta = this.usuarios.filter(usuario =>
      usuario.projetos?.some(projeto => projeto.prioridade === 'ALTA')
    );
  }

  /*===== FIM: CONFIG PARA USUÁRIOS =====*/


  /*===== COMEÇO: CONFIG PARA PROJETOS =====*/
  carregarProjetos(): void {
    this.projetosService.getProjetos().subscribe(
      (data) => {
        this.projetos = data;
        this.paginaProjetos();
        this.gerarGraficoStatusProjetos();
        this.identificarUsuariosComPrioridadeAlta();
      },
      (error) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar projetos!' })
    );
  }

  paginaProjetos(): void {
    const tamanhoPagina = 6;
    this.projetosPaginados = [];

    for (let i = 0; i < this.projetos.length; i += tamanhoPagina) {
      this.projetosPaginados.push(this.projetos.slice(i, i + tamanhoPagina));
    }

    // GARANTIR QUE O stepIndex NÃO FIQUE FORA DOS LIMITES
    this.stepIndex = Math.min(this.stepIndex, this.projetosPaginados.length - 1);
  }

  avancarStep(): void {
    if (this.stepIndex < this.projetosPaginados.length - 1) {
      this.stepIndex++;
    }
  }

  voltarStep(): void {
    if (this.stepIndex > 0) {
      this.stepIndex--;
    }
  }

  abrirProjeto(projeto: Projeto): void {
    this.projetoSelecionado = { ...projeto };
    this.projetoDialogVisivel = true;

    // Garantir que o campo 'Status' já venha preenchido
    if (!this.projetoSelecionado.status) {
      this.projetoSelecionado.status = 'Planejamento'; // Valor padrão se estiver vazio
    }

    this.mostrarCampoSenha = false;
  }

  mostrarCampoSenha: boolean = false;

  exibirCampoSenha(): void {
    this.mostrarCampoSenha = true;
  }

  fecharDialog(): void {
    this.projetoDialogVisivel = false;
    this.projetoSelecionado = null;
    this.senhaConfirmacao = '';
    this.mostrarCampoSenha = false;
  }

  salvarProjeto(): void {
    if (this.projetoSelecionado) {
      this.projetosService.atualizarProjeto(this.projetoSelecionado.id, this.projetoSelecionado).subscribe(
        () => {
          this.carregarProjetos();
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Projeto atualizado com sucesso!' });
          this.fecharDialog();
        },
        () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar o projeto!' })
      );
    }
  }

  deletarProjeto(): void {
    console.log('Iniciando exclusão do projeto:', this.projetoSelecionado?.id);

    if (!this.senhaConfirmacao) {
      console.log('Nenhuma senha fornecida.');
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Por favor, insira a senha!' });
      return;
    }

    console.log('Senha fornecida:', this.senhaConfirmacao);

    if (this.projetoSelecionado?.status === 'Planejamento' || this.projetoSelecionado?.status === 'Em_andamento') {
      console.log('Aviso: Projeto em andamento ou planejamento.');
      this.messageService.add({ severity: 'info', summary: 'Atenção', detail: 'Você está prestes a excluir um projeto em andamento ou planejamento!' });
    }

    if (this.senhaConfirmacao !== localStorage.getItem('senhaUsuario')) {
      console.log('Senha incorreta!');
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Senha incorreta!' });
      return;
    }

    console.log('Senha correta, procedendo com exclusão.');

    if (this.projetoSelecionado) {
      this.projetosService.deletarProjeto(this.projetoSelecionado.id).subscribe(
        () => {
          console.log('Projeto excluído com sucesso:', this.projetoSelecionado?.id);
          this.carregarProjetos();
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Projeto excluído com sucesso!' });
          this.fecharDialog();
        },
        (error) => {
          console.error('Erro ao excluir o projeto:', error);
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir o projeto!' });
        }
      );
    }
  }



  exibirCampoSenhaOuDeletar(): void {
    if (!this.mostrarCampoSenha) {
      this.mostrarCampoSenha = true; // Exibe o campo de senha
    } else {
      this.deletarProjeto(); // Se o campo já estiver visível, chama o método de exclusão
    }
  }

  /*===== FIM: CONFIG PARA PROJETOS =====*/



  /* ===== NOVA FUNÇÃO: RETRAIR/EXIBIR GRÁFICO ===== */
  mostrarGrafico: boolean = true;

  alternarGrafico(): void {
    this.mostrarGrafico = !this.mostrarGrafico;
    if (this.mostrarGrafico) {
      setTimeout(() => {
        this.gerarGraficoStatusProjetos(true);
      }, 300); // Delay para reaparecer suavemente
    }
  }
  /* ===== FIM: NOVA FUNÇÃO: RETRAIR/EXIBIR GRÁFICO ===== */


  /*===== INÍCIO: CONFIG PARA GRÁFICO DE STATUS =====*/
  graficoStatusProjetos: Chart | null = null;
  gerarGraficoStatusProjetos(recriar: boolean = false): void {
    const statusCounts = {
      PLANEJAMENTO: 0,
      EM_ANDAMENTO: 0,
      CONCLUIDO: 0,
      CANCELADO: 0
    };

    // Contabilizar os status corretamente
    this.projetos.forEach(projeto => {
      const statusNormalizado = projeto.status?.toUpperCase().replace(/\s+/g, '_');
      if (statusCounts[statusNormalizado as keyof typeof statusCounts] !== undefined) {
        statusCounts[statusNormalizado as keyof typeof statusCounts]++;
      }
    });

    // Se o gráfico já existe, destruir antes de recriar
    if (this.graficoStatusProjetos) {
      this.graficoStatusProjetos.destroy();
      this.graficoStatusProjetos = null;
    }

    if (!recriar && !this.mostrarGrafico) {
      return;
    }

    // Criar um novo gráfico
    this.graficoStatusProjetos = new Chart('graficoStatusProjetos', {
      type: 'pie',
      data: {
        labels: ['Planejamento', 'Em Andamento', 'Concluído', 'Cancelado'],
        datasets: [{
          data: [
            statusCounts.PLANEJAMENTO,
            statusCounts.EM_ANDAMENTO,
            statusCounts.CONCLUIDO,
            statusCounts.CANCELADO
          ],
          backgroundColor: ['#5A50FF', '#4772E6', '#8347E6', '#47A4E6'],
          hoverBackgroundColor: ['#5A50FF', '#4772E6', '#8347E6', '#47A4E6'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom', // Alternativa: 'left' se preferir
            align: 'center', // Garante que as opções fiquem alinhadas na esquerda
            labels: {
              boxWidth: 15, // Ajusta o tamanho do quadrado colorido da legenda
              padding: 10 // Adiciona espaçamento entre os itens
            }
          }
        }
      }
    });
  }
  /*===== FIM: CONFIG PARA GRÁFICO DE STATUS =====*/


  /* ================== SEÇÃO DE USUÁRIOS COM ÚLTIMOS LOGINS ================== */
  mostrarUsuarios: boolean = true;
  usuariosLoginsRecentes: Usuario[] = [];


  carregarUsuariosLogins(): void {
    this.usuariosService.getUsuarios().subscribe(
      (data) => {
        console.log('Usuários recebidos:', data);
  
        if (!Array.isArray(data)) {
          console.error('🚨 Erro: A resposta da API não é um array:', data);
          return;
        }
  
        this.usuariosLoginsRecentes = data
          .filter(usuario => usuario.ultimoLogin)
          .sort((a, b) => new Date(b.ultimoLogin).getTime() - new Date(a.ultimoLogin).getTime())
          .slice(0, 6);
      },
      (error) => {
        console.error(' Erro ao carregar últimos logins:', error);
      }
    );
  }
  
  
  


  alternarUsuarios(): void {
    this.mostrarUsuarios = !this.mostrarUsuarios;
  }

  atualizarFiltro(valor: string): void {
    this.filtroUsuario = valor.trim().toLowerCase();
    this.filtrarUsuarios();
  }

  filtrarUsuarios(): void {
    this.usuariosFiltrados = this.usuarios.filter(usuario =>
      usuario.nome.toLowerCase().includes(this.filtroUsuario) ||
      usuario.email.toLowerCase().includes(this.filtroUsuario)
    );
  }
  /* ================== FIM: SEÇÃO DE USUÁRIOS COM ÚLTIMOS LOGINS ================== */



}
