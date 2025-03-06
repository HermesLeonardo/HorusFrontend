import { Projeto } from "./projeto.model";

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    senha?: string;
    perfil: 'ADMIN' | 'USUARIO' | { label: string; value: string } | string;
    ativo: boolean;
    ultimoLogin: string | Date;  
    projetos?: Projeto[]; 
    dataCriacao: string | Date;
    temVinculacoes?: boolean;  
}
