import { Component, input, output } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import type {
  AutomataEntrada,
  MetodoAnalisis,
} from '../../models/automata';
import { validarAutomata } from '../../validators/automata';

@Component({
  selector: 'app-formulario-automata',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './formulario-automata.html',
  styleUrl: './formulario-automata.css',
})
export class FormularioAutomata {
  readonly cargando = input(false);
  readonly analizarSolicitado = output<AutomataEntrada>();

  protected readonly formulario = new FormGroup({
    numero_nodos: new FormControl(3, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(1),
        Validators.pattern(/^[0-9]+$/),
      ],
    }),

    estados: new FormControl('q0, q1, q2', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    alfabeto: new FormControl('0, 1', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    estado_inicial: new FormControl('q0', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    estados_finales: new FormControl<string[]>(['q2'], {
      nonNullable: true,
    }),

    cadena: new FormControl('0', {
      nonNullable: true,
    }),

    metodo: new FormControl<MetodoAnalisis>('afd', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    transiciones: new FormArray([
      this.crearTransicion('q0', 'ε', ['q1']),
      this.crearTransicion('q1', '0', ['q2']),
    ]),
  });

  protected get estadosDisponibles(): string[] {
    const estados = this.separarLista(
      this.formulario.controls.estados.value,
    ).filter((estado) => estado.length > 0);

    return Array.from(new Set(estados));
  }

  protected get simbolosDisponibles(): string[] {
    const simbolos = this.separarLista(
      this.formulario.controls.alfabeto.value,
    ).filter((simbolo) => simbolo.length > 0);

    return Array.from(new Set(simbolos.concat('ε')));
  }

  protected get transiciones() {
    return this.formulario.controls.transiciones;
  }

  protected get erroresValidacion(): string[] {
    return validarAutomata(this.construirEntrada());
  }

  protected agregarTransicion(): void {
    this.transiciones.push(this.crearTransicion());
  }

  protected eliminarTransicion(indice: number): void {
    this.transiciones.removeAt(indice);
  }

  protected analizar(): void {
    this.formulario.markAllAsTouched();

    if (
      this.cargando() ||
      this.formulario.invalid ||
      this.erroresValidacion.length > 0
    ) {
      return;
    }

    this.analizarSolicitado.emit(this.construirEntrada());
  }

  private construirEntrada(): AutomataEntrada {
    const valores = this.formulario.getRawValue();

    return {
      numero_nodos: valores.numero_nodos,
      estados: this.separarLista(valores.estados),
      alfabeto: this.separarLista(valores.alfabeto),
      estado_inicial: valores.estado_inicial,
      estados_finales: valores.estados_finales,
      transiciones: valores.transiciones,
      cadena: valores.cadena,
      metodo: valores.metodo,
    };
  }

  private separarLista(texto: string): string[] {
    return texto
      .split(',')
      .map((elemento) => elemento.trim());
  }

  private crearTransicion(
    origen: string = '',
    simbolo: string = '',
    destinos: string[] = [],
  ) {
    return new FormGroup({
      origen: new FormControl(origen, {
        nonNullable: true,
        validators: [Validators.required],
      }),

      simbolo: new FormControl(simbolo, {
        nonNullable: true,
        validators: [Validators.required],
      }),

      destinos: new FormControl<string[]>(destinos, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }
}