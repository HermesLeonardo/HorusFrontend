import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { CardModule } from 'primeng/card';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AuthService } from '../../core/services/auth.service';

import { LancamentoHoras } from '../../core/model/lancamento-horas.model';
import { LancamentoHorasService } from '../../core/services/lancamento-horas.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Atividade } from '../../core/model/atividade.model';

@Component({
  selector: 'app-lancamento-horas',
  templateUrl: './lancamento-horas.component.html',
  styleUrls: ['./lancamento-horas.component.scss'],
  providers: [MessageService, ConfirmationService],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    TableModule,
    DropdownModule,
    DialogModule,
    ConfirmDialogModule,
    ButtonModule,
    ToastModule,
    MultiSelectModule,
    CardModule,
    AutoCompleteModule
  ]
})
export class LancamentoHorasComponent implements OnInit {
  apiUrl: any;
  salvarLancamento() {
    throw new Error('Method not implemented.');
  }
  lancamentos: LancamentoHoras[] = [];
  atividadesOptions: { label: string; value: number }[] = [];
  usuariosOptions: { label: string; value: number }[] = [];
  dialogVisivel: boolean = false;
  lancamentoSelecionado: LancamentoHoras = this.novoLancamento();
  lancamentosFiltrados: LancamentoHoras[] | undefined;

  atividadesFiltradas: any[] = [];
  usuariosFiltrados: any[] = [];


  filtro = {
    atividade: null,
    usuario: null,
    dataInicio: null,
    dataFim: null
  };

  constructor(
    private lancamentoService: LancamentoHorasService,
    private messageService: MessageService,
    private authService: AuthService,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.carregarAtividades();
    this.carregarUsuarios();
    this.carregarLancamentos();
  }

  exibirDialog(): void { }


  filtrarLancamentos(): void {
    this.lancamentosFiltrados = this.lancamentos.filter(lancamento => {
      return (
        (!this.filtro.atividade || lancamento.idAtividade === this.filtro.atividade) &&
        (!this.filtro.usuario || lancamento.idUsuario === this.filtro.usuario) &&
        (!this.filtro.dataInicio || new Date(lancamento.dataInicio) >= new Date(this.filtro.dataInicio)) &&
        (!this.filtro.dataFim || new Date(lancamento.dataFim) <= new Date(this.filtro.dataFim))
      );
    });

    this.exibirMensagem('info', 'Filtro aplicado', 'Os lançamentos foram filtrados com sucesso!');
  }

  filtrarAtividades(event: any) {
    const query = event.query.toLowerCase();
    
    this.lancamentoService.getAtividades().subscribe({
      next: (data) => {
        this.atividadesFiltradas = data
          .filter(atividade => atividade.nome.toLowerCase().includes(query))
          .map(atividade => ({ label: atividade.nome, value: atividade.id }));
      },
      error: (err) => console.error("Erro ao filtrar atividades:", err)
    });
  }
  
  
  filtrarUsuarios(event: any) {
    const query = event.query.toLowerCase();
    this.usuariosFiltrados = this.usuariosOptions.filter(usuario =>
      usuario.label.toLowerCase().includes(query)
    );
  }
  

  resetarFiltros(): void {
    this.filtro = {
      atividade: null,
      usuario: null,
      dataInicio: null,
      dataFim: null
    };

    this.lancamentosFiltrados = [...this.lancamentos]; // Reseta a lista filtrada para mostrar todos os dados
    this.exibirMensagem('info', 'Filtros resetados', 'Todos os lançamentos foram exibidos novamente.');
  }


  carregarAtividades(): void {
    this.http.get<Atividade[]>('/api/atividades/usuario-logado').subscribe({
      next: (atividades: any[]) => {
        this.atividadesOptions = atividades.map(a => ({ label: a.nome, value: a.id }));
      },
      error: (err) => console.error("Erro ao buscar atividades do usuário logado:", err)
    });
  }
  

  carregarUsuarios(): void {

    this.usuariosOptions = [
      { label: 'Usuário A', value: 101 },
      { label: 'Usuário B', value: 102 },
      { label: 'Usuário C', value: 103 }
    ];
  }

  carregarLancamentos(): void {
    this.lancamentoService.getLancamentos().subscribe({
      next: (data) => {
        console.log("✅ Lançamentos recebidos no componente:", data);
        this.lancamentos = data;
      },
      error: (err) => {
        console.error("❌ Erro ao carregar lançamentos:", err);
        this.exibirMensagem('error', 'Erro ao carregar lançamentos', err.message);
      }
    });
  }

  



  abrirDialog(lancamento?: LancamentoHoras): void {
    if (lancamento) {
      this.lancamentoSelecionado = { ...lancamento }; // 🔹 Corrigido para o objeto correto
    } else {
      this.lancamentoSelecionado = this.novoLancamento();
    }
    this.dialogVisivel = true; // 🔹 Agora só abre quando chamado
  }


  fecharDialog(): void {
    this.dialogVisivel = false; // 🔹 Agora o botão "Cancelar" fecha corretamente o modal
  }


  confirmarExclusao(id: number): void {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      this.lancamentoService.deletarLancamento(id).subscribe({
        next: () => {
          this.exibirMensagem('success', 'Lançamento excluído', 'Registro removido com sucesso!');
          this.carregarLancamentos();
        },
        error: (err) => this.exibirMensagem('error', 'Erro ao excluir', err.message)
      });
    }
  }

  cancelarLancamento(lancamento: LancamentoHoras): void {
    if (confirm("Tem certeza que deseja cancelar este lançamento de horas?")) {
      this.lancamentoService.cancelarLancamento(lancamento.id!).subscribe(() => {
        this.exibirMensagem('warn', 'Lançamento Cancelado', 'O lançamento foi cancelado com sucesso!');
        this.carregarLancamentos(); // 🔹 Atualiza a tabela
      }, err => {
        this.exibirMensagem('error', 'Erro ao cancelar', err.message);
      });
    }
  }


  exibirMensagem(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
  novoLancamento(): LancamentoHoras {
    const dataAtual = new Date();
    return {
      idAtividade: 0,
      idUsuario: this.authService.getUserId(),
      descricao: '',
      dataInicio: `${dataAtual.getFullYear()}-MM-DD`, // Ano fixo, mês e dia preenchidos pelo usuário
      dataFim: `${dataAtual.getFullYear()}-MM-DD`,
      horaInicio: '',
      horaFim: ''
    };
  }
  

  
  
}
