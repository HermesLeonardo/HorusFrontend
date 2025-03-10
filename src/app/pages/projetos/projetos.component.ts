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
  adminsOptions: { label: string; value: number }[] = [];
  admins: Array<{ label: string; value: number }> = [];



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

        // 🔹 Garante que o primeiro campo mostre todos os usuários (Admins e Usuários comuns)
        this.usuarios = usuarios;

        this.usuariosOptions = usuarios.map(user => ({
          label: user.nome,
          value: user.id
        }));

        console.log("🎯 Todos os usuários carregados:", this.usuariosOptions);
      },
      (error) => {
        console.error("❌ Erro ao carregar usuários:", error);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar usuários!' });
      }
    );
  }


  atualizarAdminsResponsaveis(): void {
    console.log("🔄 Atualizando lista de Admins disponíveis...");

    if (!this.projetoSelecionado.idUsuarioResponsavel) {
      this.projetoSelecionado.idUsuarioResponsavel = [];
    }

    // 🔹 Filtra os usuários que são ADMIN e que foram selecionados no campo anterior
    const adminsSelecionados = this.usuarios.filter(user =>
      user.perfil === 'ADMIN' && (this.projetoSelecionado.idUsuarioResponsavel ?? []).includes(user.id)
    );


    // 🔹 Atualiza a lista de admins disponíveis
    this.adminsOptions = adminsSelecionados.map(admin => ({
      label: admin.nome,
      value: admin.id
    }));

    console.log("✅ Admins disponíveis para seleção:", this.adminsOptions);
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

      // 🔹 Garante que os arrays não sejam undefined
      this.projetoSelecionado.idUsuarioResponsavel = projeto.idUsuarioResponsavel ?? [];
    } else {
      this.projetoSelecionado = this.novoProjeto();
    }

    this.atualizarAdminsResponsaveis(); // Atualiza admins disponíveis
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

    const usuariosIds = this.projetoSelecionado.usuarios
      ? this.projetoSelecionado.usuarios.map((usuario: any) => usuario.id)
      : [];

    const novoProjeto = {
      projeto: {
        ...this.projetoSelecionado,
        status: typeof this.projetoSelecionado.status === 'object'
          ? this.projetoSelecionado.status.value
          : this.projetoSelecionado.status,
        prioridade: typeof this.projetoSelecionado.prioridade === 'object'
          ? this.projetoSelecionado.prioridade.value
          : this.projetoSelecionado.prioridade
      },
      usuariosIds: usuariosIds,  // Agora passa corretamente os IDs dos usuários
      idUsuarioResponsavel: this.projetoSelecionado.idUsuarioResponsavel?.find(id => {
        const user = this.usuarios.find(u => u.id === id);
        return user?.perfil === 'ADMIN';
      }) || null
    };



    if (this.projetoSelecionado.id) {
      this.projetosService.atualizarProjeto(
        this.projetoSelecionado.id,
        novoProjeto.projeto,
        novoProjeto.usuariosIds,
        novoProjeto.idUsuarioResponsavel ?? 0
      ).subscribe(() => {
        this.carregarProjetos();
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Projeto atualizado com sucesso!' });
        this.fecharDialog();
      }, (error) => {
        console.error("❌ Erro ao atualizar o projeto:", error);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar o projeto!' });
      });
    } else {
      this.projetosService.salvarProjeto(novoProjeto)
        .subscribe(() => {
          this.carregarProjetos();
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Projeto salvo com sucesso!' });
          this.fecharDialog();
        }, (error) => {
          console.error("❌ Erro ao salvar o projeto:", error);
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar o projeto!' });
        });
    }
    console.log("🔹 Dados sendo enviados para a API:", novoProjeto);
    console.log("📌 Admin selecionado para o projeto:", this.projetoSelecionado.idUsuarioResponsavel);
    console.log("🚀 JSON corrigido antes do envio:", novoProjeto);


  }




  visualizarProjeto(projeto: Projeto): void {
    console.log("🟢 Abrindo visualização para o projeto:", projeto);

    // 🔍 Verifica se os IDs vieram corretamente
    console.log("📌 IDs dos responsáveis recebidos:", projeto.idUsuarioResponsavel);

    const usuariosIds = projeto.usuarios ? projeto.usuarios.map(user => user.id) : [];

    // 🔹 Filtra os usuários com base nos IDs e gera os nomes corretamente
    const usuariosNomes = this.usuarios
      .filter(user => usuariosIds.includes(user.id)) // ✅ Agora sempre será um array válido
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
