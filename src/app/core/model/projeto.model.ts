export interface Projeto {
    projeto: any;
    prioridade: string;
    id: number;
    nome: string;
    descricao: string;
    status: 'Em andamento' | 'Concluído' | 'Pendente';
    dataInicio: Date;
    dataFim?: Date;
  }
  