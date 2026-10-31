import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DiagramaAutomata } from './components/diagrama-automata/diagrama-automata';
import { FormularioAutomata } from './components/formulario-automata/formulario-automata';

import type { AutomataEntrada, ResultadoAnalisis } from './models/automata';

import { AutomatasService } from './services/automatas';

interface PasoVisual {
  posicion: number;
  simbolo: string | null;
  estadosOriginales: string[];
  estadoAfd: string | null;
}

@Component({
  selector: 'app-root',

  imports: [
    NgTemplateOutlet,
    MatButtonModule,
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

  protected readonly indicePaso = signal(0);

  // Adapta los dos formatos del backend a los datos de un paso visual.
  protected readonly pasosRecorrido = computed<PasoVisual[]>(() => {
    const respuesta = this.resultado();
    if (!respuesta) return [];

    if (respuesta.metodo === 'afnde') {
      return (respuesta.recorrido_afnde ?? []).map((paso) => ({
        posicion: paso.posicion,
        simbolo: paso.simbolo,
        estadosOriginales: paso.estados,
        estadoAfd: null,
      }));
    }

    return (respuesta.recorrido_afd ?? []).map((paso) => ({
      posicion: paso.posicion,
      simbolo: paso.simbolo,
      estadoAfd: paso.estado,
      estadosOriginales:
        respuesta.afd?.estados.find((estado) => estado.id === paso.estado)?.componentes ?? [],
    }));
  });

  protected readonly pasoActual = computed(() => this.pasosRecorrido()[this.indicePaso()] ?? null);

  protected readonly estadosOriginalesActivos = computed(
    () => this.pasoActual()?.estadosOriginales ?? [],
  );

  protected readonly estadosAfdActivos = computed(() => {
    const estado = this.pasoActual()?.estadoAfd;
    return estado === null || estado === undefined ? [] : [estado];
  });

  protected readonly cadenaConsumida = computed(() =>
    Array.from(this.resultado()?.cadena ?? '')
      .slice(0, this.pasoActual()?.posicion ?? 0)
      .join(''),
  );

  protected readonly cadenaPendiente = computed(() =>
    Array.from(this.resultado()?.cadena ?? '')
      .slice(this.pasoActual()?.posicion ?? 0)
      .join(''),
  );

  protected pasoAnterior(): void {
    this.indicePaso.update((indice) => Math.max(0, indice - 1));
  }

  protected pasoSiguiente(): void {
    const ultimo = Math.max(0, this.pasosRecorrido().length - 1);
    this.indicePaso.update((indice) => Math.min(ultimo, indice + 1));
  }

  protected reiniciarRecorrido(): void {
    this.indicePaso.set(0);
  }

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
    this.reiniciarRecorrido();
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
