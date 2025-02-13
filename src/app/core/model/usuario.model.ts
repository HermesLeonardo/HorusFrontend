import { Projeto } from "./projeto.model";

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    role: 'ADMIN' | 'USER';
    ativo: boolean;
    projetos?: Projeto[];
  }
  