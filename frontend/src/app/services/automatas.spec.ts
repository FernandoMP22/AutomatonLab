import {
  HttpErrorResponse,
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type {
  AutomataEntrada,
  ResultadoAnalisis,
} from '../models/automata';
import { AutomatasService } from './automatas';

describe('AutomatasService', () => {
  let servicio: AutomatasService;
  let httpTesting: HttpTestingController;

  const url = 'http://127.0.0.1:8000/automatas/analizar';

  const entrada: AutomataEntrada = {
    numero_nodos: 3,
    estados: ['q0', 'q1', 'q2'],
    alfabeto: ['0', '1'],
    estado_inicial: 'q0',
    estados_finales: ['q2'],
    transiciones: [
      {
        origen: 'q0',
        simbolo: 'ε',
        destinos: ['q1'],
      },
      {
        origen: 'q1',
        simbolo: '0',
        destinos: ['q2'],
      },
    ],
    cadena: '0',
    metodo: 'afnde',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    servicio = TestBed.inject(AutomatasService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('envía el autómata mediante POST y entrega la respuesta', () => {
    const respuesta: ResultadoAnalisis = {
      cadena: '0',
      metodo: 'afnde',
      aceptada: true,
      afd: null,
      recorrido_afd: null,
      recorrido_afnde: [
        {
          posicion: 0,
          simbolo: null,
          estados: ['q0', 'q1'],
        },
        {
          posicion: 1,
          simbolo: '0',
          estados: ['q2'],
        },
      ],
    };

    let resultadoRecibido: ResultadoAnalisis | undefined;

    servicio.analizar(entrada).subscribe((resultado) => {
      resultadoRecibido = resultado;
    });

    const solicitud = httpTesting.expectOne(url);

    expect(solicitud.request.method).toBe('POST');
    expect(solicitud.request.body).toEqual(entrada);

    solicitud.flush(respuesta);

    expect(resultadoRecibido).toEqual(respuesta);
  });

  it('conserva el estado 422 y el detalle del error del backend', () => {
    const respuestaError = {
      detail: [
        {
          loc: ['body'],
          msg: 'El número de nodos debe coincidir con la cantidad de estados.',
          type: 'value_error',
        },
      ],
    };

    let errorRecibido: HttpErrorResponse | undefined;

    servicio.analizar(entrada).subscribe({
      error: (error: HttpErrorResponse) => {
        errorRecibido = error;
      },
    });

    const solicitud = httpTesting.expectOne(url);

    solicitud.flush(respuestaError, {
      status: 422,
      statusText: 'Unprocessable Entity',
    });

    expect(errorRecibido?.status).toBe(422);
    expect(errorRecibido?.error).toEqual(respuestaError);
  });
});