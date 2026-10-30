import { leerAutomata } from './importar-automata';
import { EJEMPLO_DIEZ_ESTADOS } from '../models/ejemplo-automata';

describe('Importación de ejemplos', () => {
  it('conserva la configuración completa de diez estados', () => {
    const texto = JSON.stringify(EJEMPLO_DIEZ_ESTADOS);

    expect(leerAutomata(texto)).toEqual(
      EJEMPLO_DIEZ_ESTADOS,
    );
  });

  it.each([
    'null',
    '[]',
    '{',
    '{"numero_nodos":10}',
  ])(
    'rechaza estructura inválida: %s',
    (texto) => {
      expect(() => leerAutomata(texto)).toThrow();
    },
  );

  it('rechaza referencias inexistentes antes de cargar', () => {
    const entrada = {
      ...EJEMPLO_DIEZ_ESTADOS,
      estado_inicial: 'otro',
    };

    expect(() =>
      leerAutomata(JSON.stringify(entrada)),
    ).toThrow();
  });

  it('rechaza nombres que se perderían al separar por comas', () => {
    const entrada = {
      numero_nodos: 1,
      estados: ['q,0'],
      alfabeto: ['0'],
      estado_inicial: 'q,0',
      estados_finales: [],
      transiciones: [],
      cadena: '',
      metodo: 'afnde',
    };

    expect(() =>
      leerAutomata(JSON.stringify(entrada)),
    ).toThrow();
  });
});