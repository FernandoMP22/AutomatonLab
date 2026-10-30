import {
  Component,
  ElementRef,
  input,
  ViewChild,
} from '@angular/core';
import type {
  AfterViewInit,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import cytoscape from 'cytoscape';
import type { Core, ElementDefinition } from 'cytoscape';

import type { AutomataEntrada } from '../../models/automata';

@Component({
  selector: 'app-diagrama-automata',
  imports: [MatButtonModule],
  templateUrl: './diagrama-automata.html',
  styleUrl: './diagrama-automata.css',
})
export class DiagramaAutomata implements AfterViewInit, OnChanges, OnDestroy {
  readonly automata = input.required<AutomataEntrada>();

  @ViewChild('contenedor')
  private contenedor?: ElementRef<HTMLDivElement>;

  private grafo?: Core;
  private observador?: ResizeObserver;

  ngAfterViewInit(): void {
    this.dibujar();

    if (this.contenedor) {
      this.observador = new ResizeObserver(() => {
        this.ajustarVista();
      });

      this.observador.observe(this.contenedor.nativeElement);
    }
  }

  ngOnChanges(): void {
    if (this.contenedor) {
      this.dibujar();
    }
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
    this.grafo?.destroy();
  }

  protected ajustarVista(): void {
    this.grafo?.resize();
    this.grafo?.fit(undefined, 36);
  }

  private dibujar(): void {
    if (!this.contenedor) {
      return;
    }

    this.grafo?.destroy();

    this.grafo = cytoscape({
      container: this.contenedor.nativeElement,
      elements: this.crearElementos(this.automata()),

      layout: {
        name: 'grid',
        rows: 1,
        padding: 36,
        avoidOverlap: true,
        sort: (a, b) => Number(a.data('orden')) - Number(b.data('orden')),
      },

      minZoom: 0.2,
      maxZoom: 3,
      wheelSensitivity: 0.2,

      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            width: 60,
            height: 60,
            'background-color': '#ffffff',
            'border-width': 2,
            'border-color': '#475569',
            color: '#0f172a',
            'font-size': 15,
            'text-valign': 'center',
            'text-halign': 'center',
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
          selector: 'edge:loop',
          style: {
            'loop-direction': '0deg',
            'loop-sweep': '-70deg',
            'control-point-step-size': 80,
          },
        },
      ],
    });
  }

  private crearElementos(entrada: AutomataEntrada): ElementDefinition[] {
    const elementos: ElementDefinition[] = [];
    const identificadores = new Map<string, string>();
    const bucles = new Map<string, Set<string>>();

    const estadosOrdenados = [
      entrada.estado_inicial,
      ...entrada.estados.filter(
        (estado) => estado !== entrada.estado_inicial,
      ),
    ];

    estadosOrdenados.forEach((estado, indice) => {
      const id = `estado-${indice}`;
      const clases: string[] = [];

      identificadores.set(estado, id);

      if (estado === entrada.estado_inicial) {
        clases.push('inicial');
      }

      if (entrada.estados_finales.includes(estado)) {
        clases.push('final');
      }

      elementos.push({
        data: {
          id,
          label: estado,
          orden: indice,
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
          elementos.push({
            data: {
              id: `transicion-${indice}-${indiceDestino}`,
              source: identificadores.get(transicion.origen)!,
              target: identificadores.get(destino)!,
              label: transicion.simbolo,
            },
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
      });
    });

    return elementos;
  }
}