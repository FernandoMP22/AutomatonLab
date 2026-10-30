import type { AutomataEntrada } from '../models/automata';
import { leerAutomata } from './importar-automata';

function crearEntrada(): AutomataEntrada {
  return {
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
    metodo: 'afd',
  };
}

describe('leerAutomata', () => {
  it('carga un ejemplo válido sin cambiar sus datos', () => {
    const entrada = crearEntrada();

    expect(leerAutomata(JSON.stringify(entrada))).toEqual(entrada);
  });

  it('rechaza texto que no es JSON', () => {
    expect(() => leerAutomata('esto no es JSON')).toThrow(
      'El texto no contiene un JSON válido.',
    );
  });

  it('rechaza null como definición del autómata', () => {
    expect(() => leerAutomata('null')).toThrow(
      'El ejemplo no tiene los campos y tipos requeridos por la API.',
    );
  });

  it('rechaza un método desconocido', () => {
    const entrada = {
      ...crearEntrada(),
      metodo: 'otro',
    };

    expect(() => leerAutomata(JSON.stringify(entrada))).toThrow(
      'El ejemplo no tiene los campos y tipos requeridos por la API.',
    );
  });

  it('rechaza destinos escritos como texto en lugar de lista', () => {
    const entrada = {
      ...crearEntrada(),
      transiciones: [
        {
          origen: 'q0',
          simbolo: '0',
          destinos: 'q1',
        },
      ],
    };

    expect(() => leerAutomata(JSON.stringify(entrada))).toThrow(
      'El ejemplo no tiene los campos y tipos requeridos por la API.',
    );
  });

  it('aplica las reglas del autómata después de revisar la estructura', () => {
    const entrada = crearEntrada();
    entrada.numero_nodos = 4;

    expect(() => leerAutomata(JSON.stringify(entrada))).toThrow(
      'El número de nodos debe coincidir con la cantidad de estados.',
    );
  });

  it('conserva la cadena vacía y permite el método afnde', () => {
    const entrada = crearEntrada();
    entrada.cadena = '';
    entrada.metodo = 'afnde';

    expect(leerAutomata(JSON.stringify(entrada))).toEqual(entrada);
  });

  it('rechaza nombres que el editor por comas no puede representar', () => {
    const entrada: AutomataEntrada = {
      numero_nodos: 1,
      estados: ['q,0'],
      alfabeto: ['0'],
      estado_inicial: 'q,0',
      estados_finales: [],
      transiciones: [],
      cadena: '',
      metodo: 'afd',
    };

    expect(() => leerAutomata(JSON.stringify(entrada))).toThrow(
      'Este editor requiere nombres de estados sin comas ni espacios al principio o al final.',
    );
  });
});