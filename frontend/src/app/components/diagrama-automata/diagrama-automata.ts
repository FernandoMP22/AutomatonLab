import {
  Component,
  computed,
  ElementRef,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import type {
  AfterViewInit,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import cytoscape from 'cytoscape';
import type {
  Core,
  ElementDefinition,
  LayoutOptions,
} from 'cytoscape';

import type {
  AutomataEntrada,
  EstadoAFDSalida,
} from '../../models/automata';

@Component({
  selector: 'app-diagrama-automata',
  imports: [MatButtonModule],
  templateUrl: './diagrama-automata.html',
  styleUrl: './diagrama-automata.css',
})
export class DiagramaAutomata implements AfterViewInit, OnChanges, OnDestroy {
  readonly automata = input.required<AutomataEntrada>();
  readonly estadosAfd = input<EstadoAFDSalida[]>([]);
  readonly estadoTrampa = input<string | null>(null);
  readonly distribucion = input<'horizontal' | 'niveles'>('horizontal');

  @ViewChild('contenedor')
  private contenedor?: ElementRef<HTMLDivElement>;

  private grafo?: Core;
  private observador?: ResizeObserver;
  private fotograma?: number;

  private readonly estructura = computed(() =>
    this.calcularEstructura(this.automata()),
  );

  protected readonly vistaParcial = signal(false);

  protected readonly alturaLienzo = computed(() => {
    if (this.distribucion() !== 'niveles') {
      return 360;
    }

    const altura = 180 + this.estructura().filas * 120;

    return Math.min(640, Math.max(360, altura));
  });

  ngAfterViewInit(): void {
    this.programarDibujo();

    if (this.contenedor) {
      this.observador = new ResizeObserver(() => {
        this.ajustarVista();
      });

      this.observador.observe(this.contenedor.nativeElement);
    }
  }

  ngOnChanges(): void {
    if (this.contenedor) {
      this.programarDibujo();
    }
  }

  ngOnDestroy(): void {
    if (this.fotograma !== undefined) {
      cancelAnimationFrame(this.fotograma);
    }

    this.observador?.disconnect();
    this.grafo?.destroy();
    this.grafo = undefined;
  }

  protected obtenerEtiqueta(estado: string): string {
    const estadoAfd = this.estadosAfd().find(
      (elemento) => elemento.id === estado,
    );

    if (!estadoAfd) {
      return estado;
    }

    if (estadoAfd.componentes.length === 0) {
      return '∅';
    }

    return `{${estadoAfd.componentes.join(', ')}}`;
  }

  protected ajustarVista(): void {
    const grafo = this.grafo;
    const contenedor = this.contenedor?.nativeElement;

    if (!grafo || !contenedor) {
      return;
    }

    grafo.resize();

    if (this.distribucion() !== 'niveles') {
      grafo.fit(undefined, 36);
      this.vistaParcial.set(false);
      return;
    }

    const margen = 24;

    grafo.fit(undefined, margen);

    const zoomCompleto = grafo.zoom();
    const zoomLegible = Math.min(1.35, Math.max(0.85, zoomCompleto));
    const esVistaParcial = zoomCompleto < 0.85;

    grafo.zoom(zoomLegible);

    if (esVistaParcial) {
      const inicial = grafo.getElementById('estado-0');
      const posicion = inicial.position();
      const radio = Number(inicial.data('tamano')) / 2;

      grafo.pan({
        x: margen + (radio - posicion.x) * zoomLegible,
        y: contenedor.clientHeight / 2 - posicion.y * zoomLegible,
      });
    } else {
      grafo.center();
    }

    this.vistaParcial.set(esVistaParcial);
  }

  protected verTodo(): void {
    const grafo = this.grafo;

    if (!grafo) {
      return;
    }

    grafo.resize();
    grafo.fit(undefined, 24);

    if (grafo.zoom() > 1.35) {
      grafo.zoom(1.35);
      grafo.center();
    }

    this.vistaParcial.set(false);
  }

  private programarDibujo(): void {
    if (this.fotograma !== undefined) {
      cancelAnimationFrame(this.fotograma);
    }

    this.fotograma = requestAnimationFrame(() => {
      this.fotograma = undefined;
      this.dibujar();
    });
  }

  private calcularEstructura(entrada: AutomataEntrada): {
    filas: number;
    niveles: number;
  } {
    const niveles = new Map<string, number>([
      [entrada.estado_inicial, 0],
    ]);

    const pendientes = [entrada.estado_inicial];

    for (let indice = 0; indice < pendientes.length; indice++) {
      const origen = pendientes[indice];
      const nivelActual = niveles.get(origen)!;

      for (const transicion of entrada.transiciones) {
        if (transicion.origen !== origen) {
          continue;
        }

        for (const destino of transicion.destinos) {
          if (!niveles.has(destino)) {
            niveles.set(destino, nivelActual + 1);
            pendientes.push(destino);
          }
        }
      }
    }

    const cantidades = new Map<number, number>();

    let filas = 1;
    let cantidadNiveles = 1;

    for (const estado of entrada.estados) {
      const nivel = niveles.get(estado) ?? 0;
      const cantidad = (cantidades.get(nivel) ?? 0) + 1;

      cantidades.set(nivel, cantidad);

      filas = Math.max(filas, cantidad);
      cantidadNiveles = Math.max(cantidadNiveles, nivel + 1);
    }

    return {
      filas,
      niveles: cantidadNiveles,
    };
  }

  private crearDistribucion(): LayoutOptions {
    if (this.distribucion() === 'niveles') {
      const estructura = this.estructura();

      return {
        name: 'breadthfirst',
        directed: true,
        roots: ['estado-0'],
        fit: false,
        padding: 24,
        spacingFactor: 1.05,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: true,

        boundingBox: {
          x1: 0,
          y1: 0,
          w: Math.max(180, (estructura.filas - 1) * 140),
          h: Math.max(280, (estructura.niveles - 1) * 220),
        },

        transform: (_nodo, posicion) => ({
          x: posicion.y,
          y: posicion.x,
        }),
      };
    }

    return {
      name: 'grid',
      rows: 1,
      fit: false,
      padding: 36,
      avoidOverlap: true,
      nodeDimensionsIncludeLabels: true,
      sort: (a, b) => Number(a.data('orden')) - Number(b.data('orden')),
    };
  }

  private dibujar(): void {
    if (!this.contenedor) {
      return;
    }

    this.grafo?.destroy();

    this.grafo = cytoscape({
      container: this.contenedor.nativeElement,
      elements: this.crearElementos(this.automata()),
      layout: this.crearDistribucion(),

      minZoom: 0.05,
      maxZoom: 3,
      wheelSensitivity: 0.2,

      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            width: 'data(tamano)',
            height: 'data(tamano)',
            'background-color': '#ffffff',
            'border-width': 2,
            'border-color': '#475569',
            color: '#0f172a',
            'font-size': 15,
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '150px',
          },
        },
        {
          selector: 'node.inicial',
          style: {
            'border-color': '#1565c0',
            'background-color': '#e3f2fd',
            color: '#1565c0',
            'font-weight': 'bold',
          },
        },
        {
          selector: 'node.final',
          style: {
            'border-width': 6,
            'border-style': 'double',
          },
        },
        {
          selector: 'node.trampa',
          style: {
            'background-color': '#fce8e6',
            'border-color': '#b3261e',
            color: '#b3261e',
            'font-weight': 'bold',
          },
        },
        {
          selector: 'edge',
          style: {
            label: 'data(label)',
            width: 2,
            'line-color': '#64748b',
            'target-arrow-color': '#64748b',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'font-size': 14,
            color: '#0f172a',
            'text-background-color': '#ffffff',
            'text-background-opacity': 1,
            'text-background-padding': '3px',
          },
        },
        {
          selector: 'edge.curva',
          style: {
            'curve-style': 'unbundled-bezier',
            'control-point-distances': 'data(curvatura)',
            'control-point-weights': '0.5',
          },
        },
        {
          selector: 'edge:loop',
          style: {
            'loop-direction': '0deg',
            'loop-sweep': '-70deg',
            'control-point-step-size': 80,
          },
        },
        {
          selector: 'edge.trampa',
          style: {
            'line-color': '#c77b75',
            'target-arrow-color': '#c77b75',
            color: '#a63a32',
          },
        },
      ],
    });

    this.ajustarVista();
  }

  private crearElementos(entrada: AutomataEntrada): ElementDefinition[] {
    const elementos: ElementDefinition[] = [];
    const identificadores = new Map<string, string>();
    const bucles = new Map<string, Set<string>>();
    const conexiones = new Map<string, number>();

    const estadosOrdenados = [
      entrada.estado_inicial,
      ...entrada.estados.filter(
        (estado) => estado !== entrada.estado_inicial,
      ),
    ];

    estadosOrdenados.forEach((estado, indice) => {
      const id = `estado-${indice}`;
      const etiqueta = this.obtenerEtiqueta(estado);
      const clases: string[] = [];

      const tamano = Math.max(
        60,
        Math.min(180, Array.from(etiqueta).length * 9 + 24),
      );

      identificadores.set(estado, id);

      if (estado === entrada.estado_inicial) {
        clases.push('inicial');
      }

      if (entrada.estados_finales.includes(estado)) {
        clases.push('final');
      }

      if (estado === this.estadoTrampa()) {
        clases.push('trampa');
      }

      elementos.push({
        data: {
          id,
          label: etiqueta,
          orden: indice,
          tamano,
        },
        classes: clases.join(' '),
      });
    });

    entrada.transiciones.forEach((transicion, indice) => {
      transicion.destinos.forEach((destino, indiceDestino) => {
        if (transicion.origen === destino) {
          if (!bucles.has(destino)) {
            bucles.set(destino, new Set<string>());
          }

          bucles.get(destino)!.add(transicion.simbolo);
        } else {
          const clases: string[] = [];

          const clave = JSON.stringify([
            transicion.origen,
            destino,
          ]);

          const numeroConexion = conexiones.get(clave) ?? 0;

          conexiones.set(clave, numeroConexion + 1);

          if (this.distribucion() === 'niveles') {
            clases.push('curva');
          }

          if (destino === this.estadoTrampa()) {
            clases.push('trampa');
          }

          elementos.push({
            data: {
              id: `transicion-${indice}-${indiceDestino}`,
              source: identificadores.get(transicion.origen)!,
              target: identificadores.get(destino)!,
              label: transicion.simbolo,
              curvatura: 40 + numeroConexion * 32,
            },
            classes: clases.join(' '),
          });
        }
      });
    });

    bucles.forEach((simbolos, estado) => {
      const id = identificadores.get(estado)!;

      elementos.push({
        data: {
          id: `bucle-${id}`,
          source: id,
          target: id,
          label: Array.from(simbolos).join(', '),
        },
        classes: estado === this.estadoTrampa() ? 'trampa' : '',
      });
    });

    return elementos;
  }
}