import type { AutomataEntrada } from '../models/automata';
import { validarAutomata } from './automata';

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

describe('validarAutomata', () => {
  it('permite el ejemplo válido del backend', () => {
    expect(validarAutomata(crearEntrada())).toEqual([]);
  });

  it('permite una cadena vacía', () => {
    const entrada = crearEntrada();
    entrada.cadena = '';

    expect(validarAutomata(entrada)).toEqual([]);
  });

  it('permite un autómata sin estados finales ni transiciones', () => {
    const entrada = crearEntrada();
    entrada.estados_finales = [];
    entrada.transiciones = [];

    expect(validarAutomata(entrada)).toEqual([]);
  });

  it('detecta un número de nodos que no coincide', () => {
    const entrada = crearEntrada();
    entrada.numero_nodos = 4;

    expect(validarAutomata(entrada)).toContain(
      'El número de nodos debe coincidir con la cantidad de estados.',
    );
  });

  it('rechaza cantidades decimales de nodos', () => {
    const entrada = crearEntrada();
    entrada.numero_nodos = 3.5;

    expect(validarAutomata(entrada)).toContain(
      'El número de nodos debe ser un entero mayor que cero.',
    );
  });

  it('detecta estados repetidos', () => {
    const entrada = crearEntrada();
    entrada.estados = ['q0', 'q1', 'q1'];

    expect(validarAutomata(entrada)).toContain(
      'Los nombres de los estados no pueden repetirse.',
    );
  });

  it('detecta nombres de estado vacíos', () => {
    const entrada = crearEntrada();
    entrada.estados = ['q0', 'q1', '   '];

    expect(validarAutomata(entrada)).toContain(
      'Define al menos un estado y evita nombres vacíos.',
    );
  });

  it('detecta un estado inicial que ya no existe', () => {
    const entrada = crearEntrada();
    entrada.estado_inicial = 'q9';

    expect(validarAutomata(entrada)).toContain(
      'El estado inicial debe pertenecer a la lista de estados.',
    );
  });

  it('detecta un estado final que ya no existe', () => {
    const entrada = crearEntrada();
    entrada.estados_finales = ['q9'];

    expect(validarAutomata(entrada)).toContain(
      'Todos los estados finales deben existir en la lista de estados.',
    );
  });

  it('rechaza epsilon dentro del alfabeto', () => {
    const entrada = crearEntrada();
    entrada.alfabeto.push('ε');

    expect(validarAutomata(entrada)).toContain(
      'ε puede utilizarse en transiciones, pero no en el alfabeto.',
    );
  });

  it('rechaza símbolos del alfabeto con varios caracteres', () => {
    const entrada = crearEntrada();
    entrada.alfabeto.push('ab');

    expect(validarAutomata(entrada)).toContain(
      'Cada símbolo del alfabeto debe tener un solo carácter.',
    );
  });

  it('detecta símbolos del alfabeto repetidos', () => {
    const entrada = crearEntrada();
    entrada.alfabeto.push('0');

    expect(validarAutomata(entrada)).toContain(
      'Los símbolos del alfabeto no pueden repetirse.',
    );
  });

  it('detecta el origen de una transición eliminado', () => {
    const entrada = crearEntrada();
    entrada.transiciones[0].origen = 'q9';

    expect(validarAutomata(entrada)).toContain(
      'Transición 1: el estado de origen no existe.',
    );
  });

  it('detecta un símbolo de transición fuera del alfabeto', () => {
    const entrada = crearEntrada();
    entrada.transiciones[1].simbolo = '2';

    expect(validarAutomata(entrada)).toContain(
      'Transición 2: selecciona un símbolo válido.',
    );
  });

  it('detecta una transición sin destinos', () => {
    const entrada = crearEntrada();
    entrada.transiciones[0].destinos = [];

    expect(validarAutomata(entrada)).toContain(
      'Transición 1: selecciona al menos un destino.',
    );
  });

  it('detecta un destino que ya no existe', () => {
    const entrada = crearEntrada();
    entrada.transiciones[0].destinos = ['q9'];

    expect(validarAutomata(entrada)).toContain(
      'Transición 1: todos los destinos deben existir.',
    );
  });

  it('detecta pares de origen y símbolo repetidos aunque no sean consecutivos', () => {
    const entrada = crearEntrada();

    entrada.transiciones.push({
      origen: 'q0',
      simbolo: 'ε',
      destinos: ['q2'],
    });

    expect(validarAutomata(entrada)).toContain(
      'Transición 3: el par origen y símbolo ya existe. Agrupa sus destinos en una sola fila.',
    );
  });

  it('permite varios destinos agrupados en una transición', () => {
    const entrada = crearEntrada();
    entrada.transiciones[0].destinos = ['q1', 'q2'];

    expect(validarAutomata(entrada)).toEqual([]);
  });

  it('rechaza símbolos de la cadena que no pertenecen al alfabeto', () => {
    const entrada = crearEntrada();
    entrada.cadena = '02';

    expect(validarAutomata(entrada)).toContain(
      'El símbolo "2" de la cadena no pertenece al alfabeto.',
    );
  });

  it('reconoce un símbolo Unicode de un solo punto de código', () => {
    const entrada = crearEntrada();
    entrada.alfabeto = ['😀'];
    entrada.cadena = '😀';
    entrada.transiciones = [];

    expect(validarAutomata(entrada)).toEqual([]);
  });
});