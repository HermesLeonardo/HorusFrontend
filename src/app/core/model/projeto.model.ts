export interface Projeto {
    projeto: any;
    prioridade: string;
    id: number;
    nome: string;
    descricao: string;
    status: 'Em_andamento' | 'Concluído' | 'Cancelado' | 'Planejamento';
    dataInicio: Date;
    dataFim?: Date;
  }
  