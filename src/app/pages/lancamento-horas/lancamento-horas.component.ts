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



  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }




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

  modalCanceladosVisivel: boolean = false;
  lancamentosCancelados: LancamentoHoras[] = [];


  modalCancelarVisivel: boolean = false;
  lancamentoParaCancelar: LancamentoHoras | null = null;

  userRole: string = '';



  filtro = {
    atividade: null as { label: string; value: number } | null,
    usuario: null as { label: string; value: number } | null,
    dataInicio: null as Date | null,
    dataFim: null as Date | null
  };


  constructor(
    private lancamentoService: LancamentoHorasService,
    private messageService: MessageService,
    private authService: AuthService,
    private http: HttpClient,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();

    if (!this.lancamentosCarregados) {
      this.carregarAtividades().then(() => {
        this.carregarLancamentos();
      }).catch(err => {
        console.error("❌ Erro ao carregar atividades:", err);
      });
    }

  }


  exibirDialog(): void { }


  filtrarLancamentos(): void {
    console.log("🔎 Filtro atual:", JSON.stringify(this.filtro, null, 2));
    console.log("🔎 Lançamentos antes do filtro:", JSON.stringify(this.lancamentos, null, 2));

    this.lancamentosFiltrados = this.lancamentos.filter(lancamento => {
      console.log("🔹 Comparando atividadeId:", lancamento.idAtividade, "===", this.filtro.atividade?.value);
      console.log("🔹 Comparando usuário:", `"${lancamento.usuario?.nome}"`, "===", `"${this.filtro.usuario?.label}"`);

      return (
        !lancamento.cancelado &&  // 🔹 Apenas exibir lançamentos não cancelados
        (!this.filtro.atividade || lancamento.idAtividade === this.filtro.atividade?.value) &&
        (!this.filtro.usuario || lancamento.usuario?.nome?.trim().toLowerCase() === this.filtro.usuario?.label.trim().toLowerCase()) &&
        (!this.filtro.dataInicio || new Date(lancamento.dataInicio).toISOString().split("T")[0] >= new Date(this.filtro.dataInicio).toISOString().split("T")[0]) &&
        (!this.filtro.dataFim || new Date(lancamento.dataFim).toISOString().split("T")[0] <= new Date(this.filtro.dataFim).toISOString().split("T")[0])
      );
    });

    console.log("✅ Lançamentos filtrados:", this.lancamentosFiltrados);
  }






  atualizarFiltroAtividade(event: any) {
    console.log("✅ Atividade selecionada:", event);

    this.filtro.atividade = event ? { label: event.label.trim(), value: Number(event.value) } : null;
    this.filtrarLancamentos();
  }

  atualizarFiltroUsuario(event: any) {
    console.log("✅ Usuário selecionado:", event);

    this.filtro.usuario = event ? { label: event.label, value: Number(event.value) } : null;
    this.filtrarLancamentos();
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

    this.http.get<any[]>(`http://localhost:8080/api/usuarios?nome=${query}`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (usuarios) => {
          console.log("✅ Usuários filtrados da API:", usuarios);
          this.usuariosFiltrados = usuarios.map(u => ({ label: u.nome, value: u.id }));
        },
        error: (err) => {
          console.error("❌ Erro ao filtrar usuários:", err);
          this.usuariosFiltrados = [];
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao filtrar usuários. Verifique sua conexão.' });
        }
      });
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


  carregarAtividades(): Promise<void> {
    return new Promise((resolve, reject) => {
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
          resolve();
        },
        error: (err) => {
          console.error("❌ Erro ao buscar atividades do usuário logado:", err);
          this.atividadesOptions = [];
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar atividades. Verifique sua conexão.' });
          reject(err);
        }
      });
    });
  }





  carregarUsuarios(): void {
    this.http.get<any[]>('http://localhost:8080/api/usuarios', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (usuarios) => {
          console.log("✅ Usuários carregados da API:", usuarios);
          this.usuariosOptions = usuarios.map(u => ({ label: u.nome, value: u.id }));
        },
        error: (err) => {
          console.error("❌ Erro ao carregar usuários:", err);
          this.usuariosOptions = [];
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar usuários. Verifique sua conexão.' });
        }
      });
  }


  private lancamentosCarregados = false; // 🔹 Flag para evitar chamadas duplicadas

  carregarLancamentos(): void {
    if (this.lancamentosCarregados) {
      console.warn("⚠ Lançamentos já foram carregados, evitando chamada duplicada.");
      return;
    }

    if (!this.atividadesOptions.length) {
      console.warn("⚠ Atividades ainda não carregadas. Tentando novamente em 500ms...");
      setTimeout(() => this.carregarLancamentos(), 500);
      return;
    }

    this.lancamentosCarregados = true;

    const userRole = this.authService.getUserRole()?.trim().toUpperCase();
    console.log("🔍 Verificando perfil do usuário:", userRole);

    const fetchLancamentos = userRole === "ROLE_ADMIN"
      ? this.lancamentoService.getLancamentos()
      : this.lancamentoService.getLancamentosDoUsuario();

    fetchLancamentos.subscribe({
      next: (data) => {
        console.log("✅ Lançamentos carregados:", data);

        this.lancamentos = data.map(lancamento => {
          console.log("🔎 Lançamento recebido:", lancamento); // Verifica o que chega da API

          // Garantindo que `idAtividade` seja extraído corretamente
          let atividadeId = 0;

          if (typeof lancamento.idAtividade === 'number') {
            atividadeId = lancamento.idAtividade;
          } else if ((lancamento as any).atividade && typeof (lancamento as any).atividade.id === 'number') {
            atividadeId = (lancamento as any).atividade.id;  // 🔥 CAPTURA O ID DA ATIVIDADE DO OBJETO CORRETO
          } else if (typeof lancamento.idAtividade === 'object' && lancamento.idAtividade?.value) {
            atividadeId = lancamento.idAtividade.value;
          }

          console.log(`🔹 idAtividade processado para lançamento ${lancamento.id}:`, atividadeId);

          const atividadeCorrespondente = this.atividadesOptions.find(a => a.value === atividadeId);

          return {
            ...lancamento,
            idAtividade: atividadeId,
            idUsuario: lancamento.idUsuario || 0,
            atividadeNome: atividadeCorrespondente
              ? atividadeCorrespondente.label.trim()
              : "ATIVIDADE NÃO ENCONTRADA"
          };
        });


        console.log("✅ Lançamentos processados:", JSON.stringify(this.lancamentos, null, 2));
        console.log("Hora Início:", this.lancamentoSelecionado?.horaInicio);
        console.log("Hora Fim:", this.lancamentoSelecionado?.horaFim);

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
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este lançamento? Essa ação não pode ser desfeita.',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.lancamentoService.deletarLancamento(id).subscribe({
          next: () => {
            this.lancamentos = this.lancamentos.filter(lancamento => lancamento.id !== id);
            this.lancamentosFiltrados = this.lancamentos; // Garante que a tabela reflete a mudança

            this.exibirMensagem('success', 'Lançamento excluído', 'Registro removido com sucesso!');
          },
          error: (err) => {
            this.exibirMensagem('error', 'Erro ao excluir', err.message);
          }
        });
      }
    });
  }



  abrirModalCancelar(lancamento: LancamentoHoras): void {
    this.lancamentoParaCancelar = lancamento;
    this.modalCancelarVisivel = true;
  }

  fecharModalCancelar(): void {
    this.modalCancelarVisivel = false;
    this.lancamentoParaCancelar = null;
  }

  confirmarCancelamento(lancamento: LancamentoHoras): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja cancelar este lançamento? Essa ação não pode ser desfeita.',
      header: 'Cancelar Lançamento',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.lancamentoService.cancelarLancamento(lancamento.id!).subscribe({
          next: () => {
            this.exibirMensagem('warn', 'Lançamento Cancelado', 'O lançamento foi cancelado com sucesso!');

            // 🔹 Atualiza a lista localmente sem precisar esperar outra requisição
            this.lancamentos = this.lancamentos.map(l =>
              l.id === lancamento.id ? { ...l, cancelado: true } : l
            );

            this.lancamentosFiltrados = this.lancamentos.filter(l => !l.cancelado); // Atualiza exibição
          },
          error: (err) => {
            this.exibirMensagem('error', 'Erro ao cancelar', err.message);
          }
        });
      }
    });
  }

  abrirModalCancelados(): void {

    this.lancamentoService.getLancamentosCancelados().subscribe({
      next: (data) => {
        console.log("✅ Lançamentos cancelados recebidos:", data);
        this.lancamentosCancelados = data;
        this.modalCanceladosVisivel = true; // Abre o modal
      },
      error: (err) => {
        console.error("❌ Erro ao buscar lançamentos cancelados:", err);
        this.exibirMensagem('error', 'Erro ao buscar cancelados', err.message);
      }
    });
  }



  restaurarLancamento(lancamento: LancamentoHoras): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja restaurar este lançamento?',
      header: 'Restaurar Lançamento',
      icon: 'pi pi-refresh',
      accept: () => {
        this.lancamentoService.restaurarLancamento(lancamento.id!).subscribe({
          next: () => {
            this.exibirMensagem('success', 'Lançamento Restaurado', 'O lançamento foi restaurado com sucesso!');

            // 🔹 Remove imediatamente o lançamento da lista de cancelados
            this.lancamentosCancelados = this.lancamentosCancelados.filter(l => l.id !== lancamento.id);

            // 🔹 Adiciona ele de volta na lista principal e fecha modal
            this.lancamentos.push({ ...lancamento, cancelado: false });
            this.modalCanceladosVisivel = false;
          },
          error: (err) => {
            this.exibirMensagem('error', 'Erro ao restaurar', err.message);
          }
        });
      }
    });
  }





  exibirMensagem(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
  novoLancamento(): LancamentoHoras {
    const dataAtual = new Date();
    return {
      idAtividade: 0,
      usuario: {
        id: this.authService.getUserId(),
        nome: this.authService.getUserName(),
        email: this.authService.getUserEmail()
      },
      descricao: '',
      dataInicio: `${dataAtual.getFullYear()}-MM-DD`,
      dataFim: `${dataAtual.getFullYear()}-MM-DD`,
      horaInicio: '',
      horaFim: ''
    };
  }




  modalVisivel: boolean = false;

  abrirModal(lancamento: LancamentoHoras): void {
    this.lancamentoSelecionado = lancamento;
    this.modalVisivel = true;
  }

  fecharModal(): void {
    this.modalVisivel = false;
  }

  getAtividadeNome(idAtividade: number): string {
    const atividade = this.atividadesOptions.find(a => a.value === idAtividade);
    return atividade ? atividade.label : "Atividade não encontrada";
  }



}
