import {
  Component,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';

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

import { EJEMPLO_DIEZ_ESTADOS } from '../../models/ejemplo-automata';
import { validarAutomata } from '../../validators/automata';
import { leerAutomata } from '../../validators/importar-automata';

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

  readonly configuracionBorrada = output<void>();

  readonly tablaTransiciones =
    viewChild<TemplateRef<unknown>>('tablaTransiciones');

  protected readonly textoEjemplo = new FormControl('', {
    nonNullable: true,
  });

  protected readonly erroresCarga = signal<string[]>([]);

  protected readonly mensajeCarga = signal('');

  private readonly sinDestinos: string[] = [];

  protected readonly formulario = new FormGroup({
    numero_nodos: new FormControl<number | null>(3, {
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

    return Array.from(
      new Set(simbolos.concat('ε')),
    );
  }

  protected get transiciones() {
    return this.formulario.controls.transiciones;
  }

  protected get erroresValidacion(): string[] {
    return validarAutomata(this.construirEntrada());
  }

  protected generarEstados(): void {
    if (this.cargando()) {
      return;
    }

    const cantidad =
      this.formulario.controls.numero_nodos.value;

    if (
      cantidad === null ||
      !Number.isInteger(cantidad) ||
      cantidad < 1
    ) {
      this.formulario.controls.numero_nodos.markAsTouched();
      return;
    }

    const estados = Array.from(
      { length: cantidad },
      (_elemento, indice) => `q${indice}`,
    );

    this.transiciones.clear();

    this.formulario.patchValue({
      estados: estados.join(', '),
      estado_inicial: 'q0',
      estados_finales: [],
    });

    this.formulario.markAsDirty();

    this.limpiarMensajes();

    this.configuracionBorrada.emit();
  }

  protected borrarConfiguracion(): void {
    if (this.cargando()) {
      return;
    }

    this.transiciones.clear();

    this.formulario.reset({
      numero_nodos: null,
      estados: '',
      alfabeto: '',
      estado_inicial: '',
      estados_finales: [],
      cadena: '',
      metodo: 'afd',
    });

    this.textoEjemplo.reset();

    this.limpiarMensajes();

    this.configuracionBorrada.emit();
  }

  protected obtenerDestinos(
    origen: string,
    simbolo: string,
  ): string[] {
    const transicion = this.transiciones.controls.find(
      (elemento) =>
        elemento.controls.origen.value === origen &&
        elemento.controls.simbolo.value === simbolo,
    );

    return (
      transicion?.controls.destinos.value ??
      this.sinDestinos
    );
  }

  protected cambiarDestinos(
    origen: string,
    simbolo: string,
    destinos: string[],
  ): void {
    if (this.cargando()) {
      return;
    }

    const indice = this.transiciones.controls.findIndex(
      (elemento) =>
        elemento.controls.origen.value === origen &&
        elemento.controls.simbolo.value === simbolo,
    );

    if (destinos.length === 0) {
      if (indice >= 0) {
        this.transiciones.removeAt(indice);
      }
    } else if (indice >= 0) {
      this.transiciones
        .at(indice)
        .controls.destinos.setValue([...destinos]);
    } else {
      this.transiciones.push(
        this.crearTransicion(
          origen,
          simbolo,
          [...destinos],
        ),
      );
    }

    this.formulario.markAsDirty();
  }

  protected limpiarReferencias(): void {
    if (this.cargando()) {
      return;
    }

    const estados = new Set(this.estadosDisponibles);
    const simbolos = new Set(this.simbolosDisponibles);

    const inicial =
      this.formulario.controls.estado_inicial;

    if (!estados.has(inicial.value)) {
      inicial.setValue(
        this.estadosDisponibles[0] ?? '',
      );
    }

    const finales =
      this.formulario.controls.estados_finales;

    finales.setValue(
      finales.value.filter(
        (estado) => estados.has(estado),
      ),
    );

    for (
      let indice = this.transiciones.length - 1;
      indice >= 0;
      indice--
    ) {
      const transicion = this.transiciones.at(indice);
      const valores = transicion.getRawValue();

      const destinos = valores.destinos.filter(
        (destino) => estados.has(destino),
      );

      if (
        !estados.has(valores.origen) ||
        !simbolos.has(valores.simbolo) ||
        destinos.length === 0
      ) {
        this.transiciones.removeAt(indice);
      } else {
        transicion.controls.destinos.setValue(destinos);
      }
    }

    this.formulario.markAsDirty();
  }

  protected cargarEjemplo(): void {
    if (this.cargando()) {
      return;
    }

    this.limpiarMensajes();

    try {
      const entrada = leerAutomata(
        this.textoEjemplo.value,
      );

      this.transiciones.clear();

      for (const transicion of entrada.transiciones) {
        this.transiciones.push(
          this.crearTransicion(
            transicion.origen,
            transicion.simbolo,
            [...transicion.destinos],
          ),
        );
      }

      this.formulario.patchValue({
        ...entrada,
        estados: entrada.estados.join(', '),
        alfabeto: entrada.alfabeto.join(', '),
      });

      this.formulario.markAsPristine();
      this.formulario.markAsUntouched();

      this.configuracionBorrada.emit();

      this.mensajeCarga.set(
        'Ejemplo cargado. Puedes editarlo y pulsar Analizar cadena.',
      );
    } catch (error: unknown) {
      const mensaje = error instanceof Error
        ? error.message
        : 'No se pudo cargar el ejemplo.';

      this.erroresCarga.set(
        mensaje.split('\n'),
      );
    }
  }

  protected cargarEjemploDiezEstados(): void {
    if (this.cargando()) {
      return;
    }

    this.textoEjemplo.setValue(
      JSON.stringify(
        EJEMPLO_DIEZ_ESTADOS,
        null,
        2,
      ),
    );

    this.cargarEjemplo();
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

    this.analizarSolicitado.emit(
      this.construirEntrada(),
    );
  }

  private limpiarMensajes(): void {
    this.erroresCarga.set([]);
    this.mensajeCarga.set('');
  }

  private construirEntrada(): AutomataEntrada {
    const valores = this.formulario.getRawValue();

    return {
      numero_nodos: valores.numero_nodos ?? 0,
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