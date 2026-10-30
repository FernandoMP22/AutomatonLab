import { Component } from '@angular/core';
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

import type { MetodoAnalisis } from '../../models/automata';

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
    const texto = this.formulario.controls.estados.value;

    return texto
      .split(',')
      .map((estado) => estado.trim())
      .filter((estado) => estado.length > 0);
  }

  protected get simbolosDisponibles(): string[] {
    const texto = this.formulario.controls.alfabeto.value;

    const simbolos = texto
      .split(',')
      .map((simbolo) => simbolo.trim())
      .filter((simbolo) => simbolo.length > 0);

    return simbolos.concat('ε');
  }

  protected get transiciones() {
    return this.formulario.controls.transiciones;
  }

  protected agregarTransicion(): void {
    this.transiciones.push(this.crearTransicion());
  }

  protected eliminarTransicion(indice: number): void {
    this.transiciones.removeAt(indice);
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