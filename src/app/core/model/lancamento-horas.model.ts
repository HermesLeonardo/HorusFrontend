export interface LancamentoHoras {
  id?: number;
  idAtividade: number;
  idUsuario: number;  // Obtém automaticamente o usuário logado
  descricao: string;
  
  dataInicio: string; // ✅ LocalDateTime no backend -> string no formato ISO
  dataFim: string;    // ✅ LocalDateTime no backend -> string no formato ISO
  dataRegistro?: string; // ✅ LocalDateTime no backend -> string no formato ISO
  
  horaInicio: string;  // Apenas "HH:mm"
  horaFim: string;     // Apenas "HH:mm"
}
