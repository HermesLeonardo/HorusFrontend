export interface LancamentoHoras {
  id?: number;
  idAtividade: number | { label: string; value: number };
  usuario: { id: number; nome: string; email: string }; // ✅ Corrigido!
  idUsuario?: number;  
  descricao: string;
  dataInicio: string; 
  dataFim: string;    
  dataRegistro?: string; 
  horaInicio: string; 
  horaFim: string;   
}
