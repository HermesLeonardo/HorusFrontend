export interface Usuario {
    id: number;
    nome: string;
    email: string;
}

export interface Atividade {
    usuariosIds: number[];
    id: number;
    id_projeto: number;
    nome: string;
    descricao: string;
    data_inicio: Date | null;
    data_fim: Date | null;
    status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'PAUSADA';
    usuariosResponsaveis?: Usuario[]; 
}
