import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Projeto } from '../../core/model/projeto.model';
import { ProjetosService } from '../../core/services/projetos.service';
import { UsuariosService } from '../../core/services/usuarios.service';
import { Usuario } from '../../core/model/usuario.model';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';



@Component({
  selector: 'app-projetos',
  templateUrl: './projetos.component.html',
  styleUrls: ['./projetos.component.scss'],
  providers: [MessageService, ConfirmationService],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DropdownModule,
    DialogModule,
    ConfirmDialogModule,
    ButtonModule,
    ToastModule,
    MultiSelectModule,  
    
  ]
})
export class ProjetosComponent implements OnInit {
  projetos: Projeto[] = [];
  projetosFiltrados: Projeto[] = [];
  projetoSelecionado: Projeto = this.novoProjeto();
  usuariosOptions: { label: string; value: number }[] = []; // Lista de usuários para o MultiSelect
  exibirDialog: boolean = false;
  usuarios: Usuario[] = [];

  filtro = { nome: '', status: null, prioridade: null };

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

  constructor(
    private projetosService: ProjetosService,
    private usuariosService: UsuariosService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.carregarProjetos();
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe(
      (usuarios) => {
        this.usuarios = usuarios; // Mantém a lista completa de usuários
        this.usuariosOptions = usuarios.map(user => ({
          label: user.nome,  // Nome do usuário exibido no MultiSelect
          value: user.id    
        }));
      },
      () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar usuários!' })
    );
  }

  abrirDialog(projeto?: Projeto): void {
    this.projetoSelecionado = projeto ? { ...projeto } : this.novoProjeto();
    this.exibirDialog = true;
  }

  fecharDialog(): void {
    this.exibirDialog = false;
  }

  salvarProjeto(): void {
    if (!this.projetoSelecionado.nome || !this.projetoSelecionado.descricao) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Preencha todos os campos obrigatórios!' });
      return;
    }
  
    const projeto = {
      nome: this.projetoSelecionado.nome,
      descricao: this.projetoSelecionado.descricao,
      status: typeof this.projetoSelecionado.status === 'object' ? this.projetoSelecionado.status.value : this.projetoSelecionado.status,
      prioridade: typeof this.projetoSelecionado.prioridade === 'object' ? this.projetoSelecionado.prioridade.value : this.projetoSelecionado.prioridade,
      dataInicio: this.projetoSelecionado.dataInicio ? new Date(this.projetoSelecionado.dataInicio).toISOString() : null,
      dataFim: this.projetoSelecionado.dataFim ? new Date(this.projetoSelecionado.dataFim).toISOString() : null
    };
  
    const usuariosIds = this.projetoSelecionado.idUsuarioResponsavel || [];
  
    console.log("📢 JSON correto antes do envio:", { projeto, usuariosIds });
  
    this.projetosService.salvarProjeto({ projeto, usuariosIds }).subscribe(
      () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Projeto salvo com sucesso!' });
        this.exibirDialog = false;
        this.carregarProjetos();
      },
      () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar o projeto!' });
      }
    );
  }
  
  

  carregarProjetos(): void {
    this.projetosService.getProjetos().subscribe(
      (data) => {
        this.projetos = data;
        this.filtrarProjetos();
      },
      () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar projetos!' })
    );
  }

  filtrarProjetos(): void {
    this.projetosFiltrados = this.projetos.filter(p =>
      (this.filtro.nome ? p.nome.toLowerCase().includes(this.filtro.nome.toLowerCase()) : true) &&
      (this.filtro.status !== null ? p.status === this.filtro.status : true) &&
      (this.filtro.prioridade !== null ? p.prioridade === this.filtro.prioridade : true)
    );
  }

  resetarFiltros(): void {
    this.filtro = { nome: '', status: null, prioridade: null };
    this.filtrarProjetos();
  }

  novoProjeto(): Projeto {
    return {
      projeto: null,
      id: 0,
      nome: '',
      descricao: '',
      status: 'Planejamento',
      prioridade: 'MEDIA',
      idUsuarioResponsavel: [], // Armazena IDs dos usuários responsáveis
      dataInicio: new Date(),
      dataFim: undefined
    };
  }
}
