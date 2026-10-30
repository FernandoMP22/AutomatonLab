import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DiagramaAutomata } from './components/diagrama-automata/diagrama-automata';
import { FormularioAutomata } from './components/formulario-automata/formulario-automata';
import type {
  AutomataEntrada,
  ResultadoAnalisis,
} from './models/automata';
import { AutomatasService } from './services/automatas';

@Component({
  selector: 'app-root',
  imports: [
    MatCardModule,
    MatToolbarModule,
    FormularioAutomata,
    DiagramaAutomata,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly automatasService = inject(AutomatasService);

  protected readonly titulo = 'AutomatonLab';
  protected readonly cargando = signal(false);
  protected readonly resultado = signal<ResultadoAnalisis | null>(null);
  protected readonly erroresApi = signal<string[]>([]);
  protected readonly automataAnalizado = signal<AutomataEntrada | null>(null);

  protected analizar(entrada: AutomataEntrada): void {
    if (this.cargando()) {
      return;
    }

    this.resultado.set(null);
    this.automataAnalizado.set(null);
    this.erroresApi.set([]);
    this.cargando.set(true);

    this.automatasService.analizar(entrada).subscribe({
      next: (respuesta) => {
        this.automataAnalizado.set(entrada);
        this.resultado.set(respuesta);
        this.cargando.set(false);
      },

      error: (error: HttpErrorResponse) => {
        this.erroresApi.set(this.obtenerMensajesError(error));
        this.cargando.set(false);
      },
    });
  }

  private obtenerMensajesError(error: HttpErrorResponse): string[] {
    if (error.status === 0) {
      return [
        'No se pudo conectar con la API. Comprueba que FastAPI esté iniciado en http://127.0.0.1:8000.',
      ];
    }

    const detalle = error.error?.detail;

    if (typeof detalle === 'string') {
      return [detalle];
    }

    if (Array.isArray(detalle) && detalle.length > 0) {
      return detalle.map((problema) => {
        if (typeof problema?.msg === 'string') {
          return problema.msg;
        }

        return 'La solicitud contiene datos inválidos.';
      });
    }

    return [
      `No se pudo completar el análisis (HTTP ${error.status}).`,
    ];
  }
}