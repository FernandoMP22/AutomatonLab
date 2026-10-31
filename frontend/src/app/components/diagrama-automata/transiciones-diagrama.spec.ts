import { agruparTransiciones } from './transiciones-diagrama';
import { EJEMPLO_INVENTARIO } from '../../models/ejemplo-automata';

describe('Conexiones del diagrama', () => {
  it('agrupa los diez dígitos sin cambiar las transiciones de entrada', () => {
    const antes = JSON.stringify(EJEMPLO_INVENTARIO);
    const conexiones = agruparTransiciones(EJEMPLO_INVENTARIO.transiciones);
    const numero = conexiones.filter((c) => ['q14', 'q15', 'q16', 'q17'].includes(c.origen));
    expect(numero).toHaveLength(4);
    expect(numero.every((c) => c.simbolos.length === 10)).toBe(true);
    expect(JSON.stringify(EJEMPLO_INVENTARIO)).toBe(antes);
  });
  it('conserva los destinos múltiples, los bucles y las flechas de regreso', () => {
    const conexiones = agruparTransiciones([
      { origen: 'q0', simbolo: 'ε', destinos: ['q0', 'q1'] },
      { origen: 'q0', simbolo: '0', destinos: ['q1'] },
      { origen: 'q1', simbolo: '1', destinos: ['q0'] },
    ]);
    expect(conexiones).toEqual([
      { origen: 'q0', destino: 'q0', simbolos: ['ε'] },
      { origen: 'q0', destino: 'q1', simbolos: ['ε', '0'] },
      { origen: 'q1', destino: 'q0', simbolos: ['1'] },
    ]);
  });
});
