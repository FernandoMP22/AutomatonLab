import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DiagramaAutomata } from './components/diagrama-automata/diagrama-automata';
import { FormularioAutomata } from './components/formulario-automata/formulario-automata';

import type { AutomataEntrada, ResultadoAnalisis } from './models/automata';

import { AutomatasService } from './services/automatas';

@Component({
  selector: 'app-root',

  imports: [
    NgTemplateOutlet,
    MatTabsModule,
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

  protected readonly pestanaActiva = signal(0);

  protected readonly titulo = 'AutomatonLab';

  protected readonly cargando = signal(false);

  protected readonly resultado = signal<ResultadoAnalisis | null>(null);

  protected readonly erroresApi = signal<string[]>([]);

  protected readonly automataAnalizado = signal<AutomataEntrada | null>(null);

  protected readonly afdParaDiagrama = computed<AutomataEntrada | null>(() => {
    const respuesta = this.resultado();

    if (!respuesta || !respuesta.afd) {
      return null;
    }

    const afd = respuesta.afd;

    return {
      numero_nodos: afd.estados.length,

      estados: afd.estados.map((estado) => estado.id),

      alfabeto: afd.alfabeto,

      estado_inicial: afd.estado_inicial,

      estados_finales: afd.estados_finales,

      transiciones: afd.transiciones.map((transicion) => ({
        origen: transicion.origen,
        simbolo: transicion.simbolo,
        destinos: [transicion.destino],
      })),

      cadena: respuesta.cadena,

      metodo: respuesta.metodo,
    };
  });

  protected limpiarAnalisis(): void {
    this.pestanaActiva.set(0);
    this.resultado.set(null);
    this.automataAnalizado.set(null);
    this.erroresApi.set([]);
  }

  protected analizar(entrada: AutomataEntrada): void {
    if (this.cargando()) {
      return;
    }

    this.limpiarAnalisis();

    this.cargando.set(true);

    this.automatasService.analizar(entrada).subscribe({
      next: (respuesta) => {
        this.automataAnalizado.set(entrada);
        this.resultado.set(respuesta);
        this.cargando.set(false);
        this.pestanaActiva.set(1);
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

    return [`No se pudo completar el análisis (HTTP ${error.status}).`];
  }
}