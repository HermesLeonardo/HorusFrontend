import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Projeto, ProjetoVisualizacao } from '../../core/model/projeto.model';
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
import { ListboxModule } from 'primeng/listbox';
import { CardModule } from 'primeng/card';


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
    ListboxModule,
    CardModule,
  ]
})
export class ProjetosComponent implements OnInit {
  projetos: Projeto[] = [];
  projetosFiltrados: Projeto[] = [];
  projetoSelecionado: Projeto = this.novoProjeto();
  usuariosOptions: { label: string; value: number }[] = [];
  exibirDialog: boolean = false;
  usuarios: Usuario[] = [];

  // Utilize o novo tipo de exibição para armazenar campos extras
  projetoVisualizacao: ProjetoVisualizacao = {
    projeto: null,
    id: 0,
    nome: '',
    descricao: '',
    status: 'PLANEJADO',
    prioridade: 'MEDIA',
    idUsuarioResponsavel: [],
    dataInicio: '',
    dataFim: '',
    dataInicioFormatada: '',
    dataFimFormatada: '',
    nomesUsuariosResponsaveis: ''
  };
  exibirVisualizacao: boolean = false;

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
    private messageService: MessageService,
    private confirmationService: ConfirmationService 
  ) { }

  ngOnInit(): void {
    this.carregarProjetos();
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    console.log("📢 Buscando usuários...");
  
    this.usuariosService.getUsuarios().subscribe(
      (usuarios) => {
        console.log("✅ Usuários carregados com sucesso:", usuarios);
        
        this.usuarios = usuarios;
        this.usuariosOptions = usuarios.map(user => ({
          label: user.nome,
          value: user.id
        }));
  
        // Adicionando um log para ver se os usuários estão sendo corretamente formatados
        console.log("🎯 Opções de usuários formatadas:", this.usuariosOptions);
      },
      (error) => {
        console.error("❌ Erro ao carregar usuários:", error);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar usuários!' });
      }
    );
  }
  

  abrirDialog(projeto?: Projeto): void {
    if (projeto) {
      this.projetoSelecionado = { ...projeto };

      this.projetoSelecionado.dataInicio = projeto.dataInicio
        ? new Date(projeto.dataInicio).toISOString().split('T')[0]
        : '';
      this.projetoSelecionado.dataFim = projeto.dataFim
        ? new Date(projeto.dataFim).toISOString().split('T')[0]
        : '';

      this.projetoSelecionado.idUsuarioResponsavel = projeto.usuarios
        ? projeto.usuarios.map(user => user.id)
        : [];

      console.log("📌 Usuários vinculados carregados:", this.projetoSelecionado.idUsuarioResponsavel);
    } else {
      this.projetoSelecionado = this.novoProjeto();
    }
    this.exibirDialog = true;
  }



  fecharDialog(): void {
    this.exibirDialog = false;
  }

  salvarProjeto(): void {
    if (!this.projetoSelecionado) {
        console.error("🚨 Nenhum projeto foi selecionado!");
        return;
    }

    const usuariosIds = this.projetoSelecionado.idUsuarioResponsavel || [];

    if (this.projetoSelecionado.id) {
      this.projetosService.atualizarProjeto(
        this.projetoSelecionado.id, // Passamos o ID para atualização
        {
          ...this.projetoSelecionado,
          status: typeof this.projetoSelecionado.status === 'object' && 'value' in this.projetoSelecionado.status ? this.projetoSelecionado.status.value : this.projetoSelecionado.status,
          prioridade: typeof this.projetoSelecionado.prioridade === 'object' && 'value' in this.projetoSelecionado.prioridade ? this.projetoSelecionado.prioridade.value : this.projetoSelecionado.prioridade
        },
        usuariosIds
      ).subscribe(
        () => {
          this.carregarProjetos();
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Projeto atualizado com sucesso!' });
          this.fecharDialog();
        },
        (error) => {
          console.error("❌ Erro ao atualizar o projeto:", error);
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar o projeto!' });
        }
      );
    } else {
      this.projetosService.salvarProjeto({
          projeto: {
              ...this.projetoSelecionado,
              status: typeof this.projetoSelecionado.status === 'object' && 'value' in this.projetoSelecionado.status ? this.projetoSelecionado.status.value : this.projetoSelecionado.status,
              prioridade: typeof this.projetoSelecionado.prioridade === 'object' && 'value' in this.projetoSelecionado.prioridade ? this.projetoSelecionado.prioridade.value : this.projetoSelecionado.prioridade
          },
          usuariosIds: usuariosIds
      }).subscribe(
          () => {
              this.carregarProjetos();
              this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Projeto salvo com sucesso!' });
              this.fecharDialog();
          },
          (error) => {
              console.error("❌ Erro ao salvar o projeto:", error);
              this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar o projeto!' });
          }
      );
    }
}




  visualizarProjeto(projeto: Projeto): void {
    console.log("🟢 Abrindo visualização para o projeto:", projeto);

    // 🔍 Verifica se os IDs vieram corretamente
    console.log("📌 IDs dos responsáveis recebidos:", projeto.idUsuarioResponsavel);

    const usuariosIds = projeto.usuarios ? projeto.usuarios.map(user => user.id) : [];

    // 🔹 Filtra os usuários com base nos IDs e gera os nomes corretamente
    const usuariosNomes = this.usuarios
      .filter(user => usuariosIds.includes(user.id))
      .map(user => user.nome)
      .join(', ');

    console.log("👥 Usuários carregados:", this.usuarios);
    console.log("✅ IDs dos responsáveis usados:", usuariosIds);
    console.log("📝 Nomes formatados:", usuariosNomes);

    this.projetoVisualizacao = {
      ...projeto,
      dataInicioFormatada: projeto.dataInicio ? new Date(projeto.dataInicio).toLocaleDateString() : 'Não definido',
      dataFimFormatada: projeto.dataFim ? new Date(projeto.dataFim).toLocaleDateString() : 'Não definido',
      nomesUsuariosResponsaveis: usuariosNomes,
      usuarios: projeto.usuarios || []  // 🔹 Agora os usuários serão passados corretamente para o HTML
    };

    this.exibirVisualizacao = true;
    console.log("✅ Modal de visualização aberto!");
  }




  fecharVisualizacao(): void {
    this.exibirVisualizacao = false;
  }

  confirmarExclusao(projeto: Projeto): void {
    this.confirmationService.confirm({
        message: `Tem certeza que deseja excluir o projeto "${projeto.nome}"? Esta ação não pode ser desfeita!`,
        acceptLabel: "Sim, Excluir",
        rejectLabel: "Cancelar",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
            this.projetosService.excluirProjeto(projeto.id).subscribe(() => {
                this.carregarProjetos();
                this.messageService.add({ 
                    severity: 'success', 
                    summary: 'Sucesso', 
                    detail: 'Projeto excluído com sucesso!' 
                });
            },
            (error) => {
                console.error("Erro ao excluir projeto:", error);
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Erro', 
                    detail: 'Não foi possível excluir o projeto.' 
                });
            });
        }
    });
}


carregarProjetos(): void {
  this.projetosService.getProjetos().subscribe(
    (data) => {
      console.log("📢 Dados recebidos da API:", data);
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
      status: 'PLANEJADO',
      prioridade: 'MEDIA',
      idUsuarioResponsavel: [],
      dataInicio: new Date(),
      dataFim: undefined
    };
  }
}
