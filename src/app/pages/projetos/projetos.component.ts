import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Projeto } from '../../core/model/projeto.model';
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
    MultiSelectModule
  ]
})
export class ProjetosComponent implements OnInit {
  projetos: Projeto[] = [];
  projetosFiltrados: Projeto[] = [];
  projetoSelecionado: Projeto = this.novoProjeto(); 
  exibirDialog: boolean = false;

  filtro = { nome: '', status: null, prioridade: null };

  statusOptions = [
    { label: 'Todos', value: null },
    { label: 'Planejamento', value: 'Planejamento' },
    { label: 'Em andamento', value: 'Em_andamento' },
    { label: 'Concluído', value: 'Concluído' },
    { label: 'Cancelado', value: 'Cancelado' }
  ];

  prioridadeOptions = [
    { label: 'Todos', value: null },
    { label: 'Alta', value: 'ALTA' },
    { label: 'Média', value: 'MEDIA' },
    { label: 'Baixa', value: 'BAIXA' }
  ];
usuariosOptions: any;


  constructor(private projetosService: ProjetosService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.carregarProjetos();
  }

  abrirDialog(projeto?: Projeto): void {
    this.projetoSelecionado = projeto ? { ...projeto } : this.novoProjeto();
    this.exibirDialog = true;
  }  

  salvarProjeto(): void {
    if (!this.projetoSelecionado) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Nenhum projeto selecionado!' });
      return;
    }

    if (!this.projetoSelecionado.nome || !this.projetoSelecionado.descricao) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Preencha todos os campos obrigatórios!' });
      return;
    }

    this.projetosService.salvarProjeto(this.projetoSelecionado!).subscribe(
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
        console.log('Projetos recebidos:', data);
        this.projetos = data;
        this.filtrarProjetos(); // Aplica os filtros assim que os dados chegam
      },
      (error) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar projetos!' })
    );
  }

  filtrarProjetos(): void {
    console.log('Filtros aplicados:', this.filtro);

    this.projetosFiltrados = this.projetos.filter(p =>
      (this.filtro.nome ? p.nome.toLowerCase().includes(this.filtro.nome.toLowerCase()) : true) &&
      (this.filtro.status !== null ? p.status === this.filtro.status : true) &&
      (this.filtro.prioridade !== null ? p.prioridade === this.filtro.prioridade : true)
    );

    console.log('Projetos filtrados:', this.projetosFiltrados);
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
      idUsuarioResponsavel: 0,
      dataInicio: new Date(),
      dataFim: undefined
    };
  }
}
