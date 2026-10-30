import type { AutomataEntrada } from './automata';

// Dos rombos conectados mediante ε y un retorno al inicio.
//
// Lenguaje:
// ((00|11)(00|11)01)*(00|11)(00|11)0
export const EJEMPLO_DIEZ_ESTADOS: AutomataEntrada = {
  numero_nodos: 10,

  estados: [
    'q0',
    'q1',
    'q2',
    'q3',
    'q4',
    'q5',
    'q6',
    'q7',
    'q8',
    'q9',
  ],

  alfabeto: ['0', '1'],

  estado_inicial: 'q0',

  estados_finales: ['q9'],

  transiciones: [
    {
      origen: 'q0',
      simbolo: '0',
      destinos: ['q1'],
    },
    {
      origen: 'q0',
      simbolo: '1',
      destinos: ['q2'],
    },
    {
      origen: 'q1',
      simbolo: '0',
      destinos: ['q3'],
    },
    {
      origen: 'q2',
      simbolo: '1',
      destinos: ['q3'],
    },
    {
      origen: 'q3',
      simbolo: 'ε',
      destinos: ['q4'],
    },
    {
      origen: 'q4',
      simbolo: '0',
      destinos: ['q5'],
    },
    {
      origen: 'q4',
      simbolo: '1',
      destinos: ['q6'],
    },
    {
      origen: 'q5',
      simbolo: '0',
      destinos: ['q7'],
    },
    {
      origen: 'q6',
      simbolo: '1',
      destinos: ['q7'],
    },
    {
      origen: 'q7',
      simbolo: 'ε',
      destinos: ['q8'],
    },
    {
      origen: 'q8',
      simbolo: '0',
      destinos: ['q9'],
    },
    {
      origen: 'q9',
      simbolo: '1',
      destinos: ['q0'],
    },
  ],

  cadena: '00110',

  metodo: 'afd',
};