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

  salvarLancamento(): void {
    if (!this.lancamentoSelecionado.idAtividade || !this.lancamentoSelecionado.horaInicio || !this.lancamentoSelecionado.horaFim) {
      this.exibirMensagem('warn', 'Campos obrigatórios', 'Preencha todos os campos obrigatórios.');
      return;
    }

    // Converte a data para o formato correto antes de enviar ao backend
    const dataEscolhida = this.lancamentoSelecionado.dataInicio;
    let dataFormatada: string;

    const dataObj = new Date(dataEscolhida); // Converte a string para um objeto Date

    if (!isNaN(dataObj.getTime())) { // Verifica se a conversão foi bem-sucedida
      const dia = dataObj.getDate().toString().padStart(2, '0');
      const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
      const ano = dataObj.getFullYear();
      dataFormatada = `${ano}-${mes}-${dia}`;
    } else {
      this.exibirMensagem('error', 'Erro no formato da data', 'A data selecionada não é válida.');
      return;
    }


    // Formata a data para o formato dd/MM esperado pelo backend
    const formatarDataParaBackend = (data: any): string => {
      if (!data) return ""; // Evita valores nulos

      if (typeof data === "string") {
        return data.includes("-") ? data.split("-").reverse().slice(0, 2).join("/") : data;
      }

      const dateObj = new Date(data);
      const dia = dateObj.getDate().toString().padStart(2, "0");
      const mes = (dateObj.getMonth() + 1).toString().padStart(2, "0");

      return `${dia}/${mes}`; // Retorna no formato "dd/MM"
    };

    // Formata a hora para o formato HH:mm esperado pelo backend
    const formatarHoraParaBackend = (hora: any): string => {
      if (!hora) return ""; // Evita valores nulos

      if (typeof hora === "string" && hora.includes("T")) {
        return hora.split("T")[1].substring(0, 5); // Extrai HH:mm de "2025-03-06T21:37:41.892Z"
      }

      const dateObj = new Date(hora);
      const horas = dateObj.getHours().toString().padStart(2, "0");
      const minutos = dateObj.getMinutes().toString().padStart(2, "0");

      return `${horas}:${minutos}`; // Retorna no formato HH:mm
    };


    const payload = {
      idAtividade: typeof this.lancamentoSelecionado.idAtividade === "object"
        ? this.lancamentoSelecionado.idAtividade.value
        : this.lancamentoSelecionado.idAtividade,

      idUsuario: this.authService.getUserId(), 
      usuario: { 
        id: this.authService.getUserId(), 
        nome: this.authService.getUserName(), 
        email: this.authService.getUserEmail() 
      }, 

      descricao: this.lancamentoSelecionado.descricao,
      dataInicio: formatarDataParaBackend(this.lancamentoSelecionado.dataInicio), 
      dataFim: formatarDataParaBackend(this.lancamentoSelecionado.dataInicio),
      horaInicio: formatarHoraParaBackend(this.lancamentoSelecionado.horaInicio), 
      horaFim: formatarHoraParaBackend(this.lancamentoSelecionado.horaFim) 
    };

    console.log("📤 Enviando lançamento para API:", JSON.stringify(payload));





    this.lancamentoService.criarLancamento(payload).subscribe({
      next: (novoLancamento) => {
        this.lancamentos.push(novoLancamento);
        this.exibirMensagem('success', 'Lançamento criado', 'O lançamento foi registrado com sucesso.');
        this.fecharDialog();
        this.carregarLancamentos();
      },
      error: (err) => {
        console.error("❌ Erro ao criar lançamento:", err);
        this.exibirMensagem('error', 'Erro ao salvar', 'Ocorreu um erro ao salvar o lançamento.');
      }
    });
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

    this.lancamentoService.getAtividadesDoUsuario().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          console.warn("⚠ Nenhuma atividade vinculada ao usuário.");
          this.atividadesFiltradas = [];
          this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Você não está vinculado a nenhuma atividade.' });
          return;
        }

        this.atividadesFiltradas = data
          .filter(atividade => atividade.nome.toLowerCase().includes(query))
          .map(atividade => ({ label: atividade.nome, value: atividade.id }));
      },
      error: (err) => {
        console.error("❌ Erro ao buscar atividades:", err);
        this.atividadesFiltradas = [];
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar atividades. Verifique sua conexão.' });
      }
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
    this.lancamentoService.getAtividadesDoUsuario().subscribe({
      next: (atividades) => {
        console.log("✅ Atividades carregadas:", atividades);

        if (!atividades || atividades.length === 0) {
          console.warn("⚠ Nenhuma atividade vinculada ao usuário.");
          this.atividadesOptions = [];
          this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Você não está vinculado a nenhuma atividade.' });
        } else {
          this.atividadesOptions = atividades.map(a => ({ label: a.nome, value: a.id }));
          console.log("📌 Atividades para dropdown:", this.atividadesOptions);
        }
      },
      error: (err) => {
        console.error("❌ Erro ao buscar atividades do usuário logado:", err);
        this.atividadesOptions = [];
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar atividades. Verifique sua conexão.' });
      }
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
        console.log("✅ TODOS OS LANÇAMENTOS RECEBIDOS DA API:", data);
  
        const userId = Number(this.authService.getUserId());
        const userRole = this.authService.getUserRole()?.trim().toUpperCase();
  
        console.log("🔍 ID do Usuário Atual:", userId);
        console.log("🔍 Role do Usuário Atual:", userRole);
  
        data.forEach((lancamento, index) => {
          console.log(`📝 Estrutura do lançamento [${index}]:`, lancamento);
        });
  
        this.lancamentos = userRole === 'ROLE_ADMIN'
          ? data
          : data.filter(lancamento => Number(lancamento.usuario.id) === userId);
  
        console.log("✅ Lançamentos filtrados para exibição:", this.lancamentos);
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
    this.dialogVisivel = true; 
  }


  fecharDialog(): void {
    this.dialogVisivel = false; 
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
      usuario: {
        id: this.authService.getUserId(), // ✅ Pegando o ID do usuário autenticado
        nome: this.authService.getUserName(), // 🔹 Certifique-se de ter esse método no AuthService
        email: this.authService.getUserEmail() // 🔹 Certifique-se de ter esse método no AuthService
      },
      descricao: '',
      dataInicio: `${dataAtual.getFullYear()}-MM-DD`,
      dataFim: `${dataAtual.getFullYear()}-MM-DD`,
      horaInicio: '',
      horaFim: ''
    };
  }
  








}
