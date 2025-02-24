export interface Projeto {
  projeto: any;
  id: number;
  nome: string;
  descricao: string;
  status: 'Em_andamento' | 'Concluído' | 'Cancelado' | 'Planejamento' | { value: string; label: string };
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA' | { value: string; label: string };
  idUsuarioResponsavel: number[];
  dataInicio: Date;
  dataFim?: Date;
}
