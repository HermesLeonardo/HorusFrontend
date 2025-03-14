export interface LancamentoHoras {
  id?: number;
  idAtividade: number | {
    id: any; label: string; value: number 
};
  usuario: { id: number; nome: string; email: string };
  idUsuario?: number;  
  descricao: string;
  dataInicio: string; 
  dataFim: string;    
  dataRegistro?: string; 
  horaInicio: string; 
  horaFim: string;  
  atividadeNome?: string;   
  cancelado?: boolean
}
