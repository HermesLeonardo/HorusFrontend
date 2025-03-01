export interface Atividade {
    id: number;
    id_projeto: number;
    nome: string;
    descricao: string;
    data_inicio: Date;
    data_fim: Date;
    status: 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'PAUSADA';
    id_usuario_responsavel?: number | null; // Agora pode ser null caso necessário
}