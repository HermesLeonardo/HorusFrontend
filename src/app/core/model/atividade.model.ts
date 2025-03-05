
export interface Atividade {
    projeto: any;
    usuariosIds: number[];
    id: number;
    id_projeto: number;
    nome: string;
    descricao: string;
    dataInicio: Date | null; 
    dataFim: Date  | null;     
    status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'PAUSADA';
    usuariosResponsaveis?: Usuario[];
}


export interface Usuario {
    id: number;
    nome: string;
    email: string;
}