import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RelatorioService } from '../../core/services/relatorio.service';

@Component({
  selector: 'app-relatorio',
  standalone: true, // ✅ Indica que é um componente standalone
  imports: [CommonModule, FormsModule], // ✅ Adicionando o FormsModule aqui
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss']
})
export class RelatorioComponent {
  filtros = {
    idProjeto: null,
    idUsuario: null,
    idAtividade: null,
    dataInicio: null,
    dataFim: null
  };

  relatorios: any[] = [];

  constructor(private relatorioService: RelatorioService) {}

  buscarRelatorios(): void {
    this.relatorioService.obterRelatorios(this.filtros).subscribe(data => {
      this.relatorios = data;
    });
  }
}
