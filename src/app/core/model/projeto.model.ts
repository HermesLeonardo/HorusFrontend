export interface Projeto {
  projeto: any;
  id: number;
  nome: string;
  descricao: string;
  status: 'PLANEJADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  idUsuarioResponsavel: number[];
  dataInicio: Date | string;
  dataFim?: Date | string;
}

export interface ProjetoVisualizacao extends Projeto {
  dataInicioFormatada: string;
  dataFimFormatada: string;
  nomesUsuariosResponsaveis: string;
}
