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



@Component({
  selector: 'app-projetos',
  templateUrl: './projetos.component.html',
  styleUrls: ['./projetos.component.scss'],
  providers: [MessageService, ConfirmationService],
  imports: [TableModule, DropdownModule, FormsModule, CommonModule, DialogModule, ConfirmDialogModule, ButtonModule, ToastModule],
  standalone: true
})
export class ProjetosComponent implements OnInit {
  projetos: Projeto[] = [];
  projetoSelecionado: Projeto | null = null;
  exibirDialog: boolean = false;

  constructor(
    private projetosService: ProjetosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.carregarProjetos();
  }

  carregarProjetos(): void {
    this.projetosService.listarProjetos().subscribe((projetos) => {
      this.projetos = projetos;
    });
  }

  abrirDialog(projeto?: Projeto): void {
    this.projetoSelecionado = projeto ? { ...projeto } : this.novoProjeto();
    this.exibirDialog = true;
  }

  salvarProjeto(): void {
    if (this.projetoSelecionado) {
      if (this.projetoSelecionado.id) {
        this.projetosService.editarProjeto(this.projetoSelecionado).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Projeto atualizado!' });
          this.carregarProjetos();
        });
      } else {
        this.projetosService.criarProjeto(this.projetoSelecionado).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Projeto criado!' });
          this.carregarProjetos();
        });
      }
      this.exibirDialog = false;
    }
  }

  confirmarExclusao(projeto: Projeto): void {
    this.confirmationService.confirm({
      message: `Deseja excluir o projeto "${projeto.nome}"?`,
      accept: () => {
        this.projetosService.excluirProjeto(projeto.id!).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Projeto excluído!' });
          this.carregarProjetos();
        });
      }
    });
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
