export interface Projeto {
    projeto: any;
    id: number;
    nome: string;
    descricao: string;
    status: 'Em_andamento' | 'Concluído' | 'Cancelado' | 'Planejamento';
    prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
    idUsuarioResponsavel: number;
    dataInicio: Date;
    dataFim?: Date;
  }
  