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
  SimpleChanges,
} from '@angular/core';

import { MatButtonModule } from '@angular/material/button';

import cytoscape from 'cytoscape';

import type {
  Core,
  EdgeSingular,
  ElementDefinition,
  LayoutOptions,
} from 'cytoscape';

import type {
  AutomataEntrada,
  EstadoAFDSalida,
} from '../../models/automata';

import { agruparTransiciones } from './transiciones-diagrama';
import type { ConexionDiagrama } from './transiciones-diagrama';

@Component({
  selector: 'app-diagrama-automata',
  imports: [MatButtonModule],
  templateUrl: './diagrama-automata.html',
  styleUrl: './diagrama-automata.css',
})
export class DiagramaAutomata
  implements AfterViewInit, OnChanges, OnDestroy
{
  readonly automata = input.required<AutomataEntrada>();
  readonly estadosAfd = input<EstadoAFDSalida[]>([]);
  readonly estadoTrampa = input<string | null>(null);

  readonly distribucion =
    input<'horizontal' | 'niveles'>('niveles');

  readonly activo = input(true);

  @ViewChild('contenedor')
  private contenedor?: ElementRef<HTMLDivElement>;

  @ViewChild('detalleFlotante')
  private detalleFlotante?: ElementRef<HTMLElement>;

  private grafo?: Core;
  private observador?: ResizeObserver;
  private fotograma?: number;
  private fotogramaDetalle?: number;

  private readonly estructura = computed(() =>
    this.calcularEstructura(this.automata()),
  );

  protected readonly vistaParcial = signal(false);

  protected readonly posicionDetalle =
    signal<{ x: number; y: number } | null>(null);

  protected readonly conexionSeleccionada =
    signal<ConexionDiagrama | null>(null);

  protected readonly conexionesCompactas = computed(() =>
    agruparTransiciones(
      this.automata().transiciones,
    ).filter(
      (conexion) => conexion.simbolos.length > 3,
    ),
  );

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
        if (
          !this.activo() ||
          !this.contenedor?.nativeElement.clientWidth
        ) {
          return;
        }

        if (this.grafo) {
          this.ajustarVista();
        } else {
          this.programarDibujo();
        }
      });

      this.observador.observe(
        this.contenedor.nativeElement,
      );
    }
  }

  ngOnChanges(cambios: SimpleChanges): void {
    if (
      cambios['automata'] ||
      cambios['estadosAfd'] ||
      cambios['estadoTrampa']
    ) {
      this.cerrarDetalle();
    }

    if (!this.contenedor || !this.activo()) {
      return;
    }

    // Conserva las posiciones al regresar a la pestaña.
    if (
      this.grafo &&
      Object.keys(cambios).every(
        (clave) => clave === 'activo',
      )
    ) {
      this.ajustarVista();
    } else {
      this.programarDibujo();
    }
  }

  ngOnDestroy(): void {
    if (this.fotograma !== undefined) {
      cancelAnimationFrame(this.fotograma);
    }

    if (this.fotogramaDetalle !== undefined) {
      cancelAnimationFrame(this.fotogramaDetalle);
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

    if (
      !grafo ||
      !contenedor ||
      !this.activo() ||
      contenedor.clientWidth === 0
    ) {
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

    const zoomLegible = Math.min(
      1.35,
      Math.max(0.85, zoomCompleto),
    );

    const esVistaParcial = zoomCompleto < 0.85;

    grafo.zoom(zoomLegible);

    if (esVistaParcial) {
      const inicial =
        grafo.getElementById('estado-0');

      const posicion = inicial.position();

      const radio =
        Number(inicial.data('tamano')) / 2;

      grafo.pan({
        x:
          margen +
          (radio - posicion.x) * zoomLegible,

        y:
          contenedor.clientHeight / 2 -
          posicion.y * zoomLegible,
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

  protected mostrarConexion(
    conexion: ConexionDiagrama,
  ): void {
    this.conexionSeleccionada.set(conexion);

    this.grafo
      ?.edges()
      .removeClass('seleccionada');

    this.grafo
      ?.edges()
      .filter(
        (arista) =>
          arista.data('origen') === conexion.origen &&
          arista.data('destino') === conexion.destino,
      )
      .addClass('seleccionada');

    this.posicionDetalle.set(null);

    this.programarDetalle();
  }

  protected seleccionarDesdeLista(
    evento: Event,
  ): void {
    const selector = evento.target;

    if (!(selector instanceof HTMLSelectElement)) {
      return;
    }

    if (selector.value === '') {
      this.cerrarDetalle();
      return;
    }

    const conexion = this.conexionesCompactas()[
      Number(selector.value)
    ];

    if (conexion) {
      this.mostrarConexion(conexion);

      const arista = this.grafo
        ?.edges()
        .filter(
          (elemento) =>
            elemento.data('origen') === conexion.origen &&
            elemento.data('destino') === conexion.destino,
        );

      if (arista?.length) {
        this.grafo?.center(arista);
      }
    }
  }

  protected indiceSeleccionado(): string {
    const seleccionada =
      this.conexionSeleccionada();

    if (!seleccionada) {
      return '';
    }

    const indice = this.conexionesCompactas().findIndex(
      (conexion) =>
        conexion.origen === seleccionada.origen &&
        conexion.destino === seleccionada.destino,
    );

    return indice < 0 ? '' : String(indice);
  }

  protected cerrarDetalle(): void {
    this.conexionSeleccionada.set(null);
    this.posicionDetalle.set(null);

    if (this.fotogramaDetalle !== undefined) {
      cancelAnimationFrame(this.fotogramaDetalle);
      this.fotogramaDetalle = undefined;
    }

    this.grafo
      ?.edges()
      .removeClass('seleccionada');
  }

  private programarDetalle(): void {
    if (
      !this.conexionSeleccionada() ||
      this.fotogramaDetalle !== undefined
    ) {
      return;
    }

    this.fotogramaDetalle = requestAnimationFrame(() => {
      this.fotogramaDetalle = undefined;
      this.posicionarDetalle();
    });
  }

  private posicionarDetalle(): void {
    const conexion =
      this.conexionSeleccionada();

    const contenedor =
      this.contenedor?.nativeElement;

    const panel =
      this.detalleFlotante?.nativeElement;

    if (
      !conexion ||
      !this.grafo ||
      !contenedor ||
      !panel ||
      !this.activo() ||
      !contenedor.clientWidth
    ) {
      this.posicionDetalle.set(null);
      return;
    }

    const arista = this.grafo
      .edges()
      .filter(
        (elemento) =>
          elemento.data('origen') === conexion.origen &&
          elemento.data('destino') === conexion.destino,
      )
      .first() as EdgeSingular;

    if (!arista.length) {
      this.cerrarDetalle();
      return;
    }

    const punto = arista.renderedMidpoint();

    const margen = 8;
    const separacion = 12;

    const ancho = panel.offsetWidth;
    const alto = panel.offsetHeight;

    // Centra el cuadro sobre la etiqueta.
    // Si no cabe arriba, prueba debajo.
    const arriba = punto.y - alto - separacion;

    const y = arriba >= margen
      ? arriba
      : punto.y + separacion;

    const x = punto.x - ancho / 2;

    // Mantiene el cuadro dentro del lienzo.
    this.posicionDetalle.set({
      x: Math.max(
        margen,
        Math.min(
          x,
          contenedor.clientWidth - ancho - margen,
        ),
      ),

      y: Math.max(
        margen,
        Math.min(
          y,
          contenedor.clientHeight - alto - margen,
        ),
      ),
    });
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

  private calcularEstructura(
    entrada: AutomataEntrada,
  ): {
    filas: number;
    niveles: number;
  } {
    const niveles = new Map<string, number>([
      [entrada.estado_inicial, 0],
    ]);

    const pendientes = [entrada.estado_inicial];

    for (
      let indice = 0;
      indice < pendientes.length;
      indice++
    ) {
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

      const cantidad =
        (cantidades.get(nivel) ?? 0) + 1;

      cantidades.set(nivel, cantidad);

      filas = Math.max(filas, cantidad);

      cantidadNiveles = Math.max(
        cantidadNiveles,
        nivel + 1,
      );
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

          w: Math.max(
            180,
            (estructura.filas - 1) * 140,
          ),

          h: Math.max(
            280,
            (estructura.niveles - 1) * 220,
          ),
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

      sort: (a, b) =>
        Number(a.data('orden')) -
        Number(b.data('orden')),
    };
  }

  private dibujar(): void {
    if (
      !this.contenedor ||
      !this.activo() ||
      this.contenedor.nativeElement.clientWidth === 0
    ) {
      return;
    }

    this.cerrarDetalle();

    this.grafo?.destroy();

    this.grafo = cytoscape({
      container: this.contenedor.nativeElement,

      elements: this.crearElementos(
        this.automata(),
      ),

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
            'text-events': 'yes',
            width: 2,
            'line-color': '#64748b',
            'target-arrow-color': '#64748b',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'font-size': 14,
            'text-wrap': 'wrap',
            'text-max-width': '130px',
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
          selector: 'edge.compacta',

          style: {
            'font-weight': 'bold',
          },
        },

        {
          selector: 'edge.seleccionada',

          style: {
            width: 4,
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

    this.grafo.on(
      'tap',
      'edge.compacta',
      (evento) => {
        const origen =
          evento.target.data('origen');

        const destino =
          evento.target.data('destino');

        const conexion =
          this.conexionesCompactas().find(
            (elemento) =>
              elemento.origen === origen &&
              elemento.destino === destino,
          );

        if (conexion) {
          this.mostrarConexion(conexion);
        }
      },
    );

    this.grafo.on('tap', (evento) => {
      if (evento.target === this.grafo) {
        this.cerrarDetalle();
      }
    });

    this.grafo.on(
      'pan zoom position render',
      () => this.programarDetalle(),
    );

    this.ajustarVista();
  }

  private crearElementos(
    entrada: AutomataEntrada,
  ): ElementDefinition[] {
    const elementos: ElementDefinition[] = [];

    const identificadores =
      new Map<string, string>();

    const estadosOrdenados = [
      entrada.estado_inicial,

      ...entrada.estados.filter(
        (estado) =>
          estado !== entrada.estado_inicial,
      ),
    ];

    estadosOrdenados.forEach((estado, indice) => {
      const id = `estado-${indice}`;

      const etiqueta =
        this.obtenerEtiqueta(estado);

      const clases: string[] = [];

      const tamano = Math.max(
        60,
        Math.min(
          180,
          Array.from(etiqueta).length * 9 + 24,
        ),
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

    const niveles = new Map<string, number>([
      [entrada.estado_inicial, 0],
    ]);

    const pendientes = [entrada.estado_inicial];

    for (
      let indice = 0;
      indice < pendientes.length;
      indice++
    ) {
      const origen = pendientes[indice];

      for (const transicion of entrada.transiciones) {
        if (transicion.origen !== origen) {
          continue;
        }

        for (const destino of transicion.destinos) {
          if (!niveles.has(destino)) {
            niveles.set(
              destino,
              niveles.get(origen)! + 1,
            );

            pendientes.push(destino);
          }
        }
      }
    }

    const conexiones = agruparTransiciones(
      entrada.transiciones,
    );

    conexiones.forEach((conexion, indice) => {
      const clases: string[] = [];

      const esCompacta =
        conexion.simbolos.length > 3;

      if (esCompacta) {
        clases.push('compacta');
      }

      const esBucle =
        conexion.origen === conexion.destino;

      const nivelOrigen =
        niveles.get(conexion.origen) ?? 0;

      const nivelDestino =
        niveles.get(conexion.destino) ?? 0;

      const esRetorno =
        !esBucle && nivelDestino <= nivelOrigen;

      if (
        this.distribucion() === 'niveles' &&
        esRetorno
      ) {
        clases.push('curva');
      }

      if (conexion.destino === this.estadoTrampa()) {
        clases.push('trampa');
      }

      elementos.push({
        data: {
          id: `conexion-${indice}`,

          source:
            identificadores.get(conexion.origen)!,

          target:
            identificadores.get(conexion.destino)!,

          origen: conexion.origen,

          destino: conexion.destino,

          label: esCompacta
            ? `${conexion.simbolos.length} símbolos ▸`
            : conexion.simbolos.join(', '),

          curvatura:
            70 +
            Math.abs(nivelOrigen - nivelDestino) * 25,
        },

        classes: clases.join(' '),
      });
    });

    return elementos;
  }
}