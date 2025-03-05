export interface Usuario {
    id: number;
    nome: string;
    email: string;
}

export interface Atividade {
    projeto: any;
    usuariosIds: number[];
    id: number;
    id_projeto: number;
    nome: string;
    descricao: string;
    dataInicio: Date | null; // Alterado de data_inicio para dataInicio
    dataFim: Date | null;     // Alterado de data_fim para dataFim
    status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'PAUSADA';
    usuariosResponsaveis?: Usuario[];
}
