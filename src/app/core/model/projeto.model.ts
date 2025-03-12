import { Usuario } from './usuario.model';

export interface Projeto {
  id: number;
  nome: string;
  descricao: string;
  status: "PLANEJADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO" | { label: string; value: string } | string;
  prioridade: "ALTA" | "MEDIA" | "BAIXA" | { label: string; value: string } | string;  
  dataInicio: Date | string;
  dataFim?: Date | string;
  idUsuarioResponsavel?: number[];
  usuarios?: Usuario[];
}



export interface ProjetoVisualizacao extends Projeto {
  dataInicioFormatada: string;
  dataFimFormatada: string;
  nomesUsuariosResponsaveis: string;
}
