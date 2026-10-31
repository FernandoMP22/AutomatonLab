import type { AutomataEntrada, TransicionEntrada } from './automata';

const digitos = Array.from({ length: 10 }, (_, indice) => String(indice));
const transicionesNumero: TransicionEntrada[] = [];

for (let origen = 14; origen < 18; origen++) {
  for (const simbolo of digitos) {
    transicionesNumero.push({
      origen: `q${origen}`,
      simbolo,
      destinos: [`q${origen + 1}`],
    });
  }
}

// Reconoce códigos de pedido, devolución o compra con cuatro dígitos.
// Lenguaje: (PED|DEV|COM)-[0-9]{4}
export const EJEMPLO_INVENTARIO: AutomataEntrada = {
  numero_nodos: 19,
  estados: Array.from({ length: 19 }, (_, indice) => `q${indice}`),
  alfabeto: ['P', 'E', 'D', 'V', 'C', 'O', 'M', '-', ...digitos],
  estado_inicial: 'q0',
  estados_finales: ['q18'],
  transiciones: [
    { origen: 'q0', simbolo: 'ε', destinos: ['q1', 'q5', 'q9'] },
    { origen: 'q1', simbolo: 'P', destinos: ['q2'] },
    { origen: 'q2', simbolo: 'E', destinos: ['q3'] },
    { origen: 'q3', simbolo: 'D', destinos: ['q4'] },
    { origen: 'q5', simbolo: 'D', destinos: ['q6'] },
    { origen: 'q6', simbolo: 'E', destinos: ['q7'] },
    { origen: 'q7', simbolo: 'V', destinos: ['q8'] },
    { origen: 'q9', simbolo: 'C', destinos: ['q10'] },
    { origen: 'q10', simbolo: 'O', destinos: ['q11'] },
    { origen: 'q11', simbolo: 'M', destinos: ['q12'] },
    { origen: 'q4', simbolo: 'ε', destinos: ['q13'] },
    { origen: 'q8', simbolo: 'ε', destinos: ['q13'] },
    { origen: 'q12', simbolo: 'ε', destinos: ['q13'] },
    { origen: 'q13', simbolo: '-', destinos: ['q14'] },
    ...transicionesNumero,
  ],
  cadena: 'PED-1234',
  metodo: 'afd',
};
