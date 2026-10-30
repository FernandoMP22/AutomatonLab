import type { AutomataEntrada } from '../models/automata';

export function validarAutomata(entrada: AutomataEntrada): string[] {
  const errores: string[] = [];

  const estados = new Set(entrada.estados);
  const alfabeto = new Set(entrada.alfabeto);

  if (
    !Number.isInteger(entrada.numero_nodos) ||
    entrada.numero_nodos < 1
  ) {
    errores.push('El número de nodos debe ser un entero mayor que cero.');
  }

  if (entrada.numero_nodos !== entrada.estados.length) {
    errores.push('El número de nodos debe coincidir con la cantidad de estados.');
  }

  if (
    entrada.estados.length === 0 ||
    entrada.estados.some((estado) => estado.trim().length === 0)
  ) {
    errores.push('Define al menos un estado y evita nombres vacíos.');
  }

  if (estados.size !== entrada.estados.length) {
    errores.push('Los nombres de los estados no pueden repetirse.');
  }

  if (!estados.has(entrada.estado_inicial)) {
    errores.push('El estado inicial debe pertenecer a la lista de estados.');
  }

  if (new Set(entrada.estados_finales).size !== entrada.estados_finales.length) {
    errores.push('Los estados finales no pueden repetirse.');
  }

  if (entrada.estados_finales.some((estado) => !estados.has(estado))) {
    errores.push('Todos los estados finales deben existir en la lista de estados.');
  }

  if (entrada.alfabeto.length === 0) {
    errores.push('El alfabeto debe contener al menos un símbolo.');
  }

  if (alfabeto.size !== entrada.alfabeto.length) {
    errores.push('Los símbolos del alfabeto no pueden repetirse.');
  }

  if (entrada.alfabeto.some((simbolo) => Array.from(simbolo).length !== 1)) {
    errores.push('Cada símbolo del alfabeto debe tener un solo carácter.');
  }

  if (alfabeto.has('ε')) {
    errores.push('ε puede utilizarse en transiciones, pero no en el alfabeto.');
  }

  const paresTransiciones = new Set<string>();

  entrada.transiciones.forEach((transicion, indice) => {
    const numero = indice + 1;

    if (!estados.has(transicion.origen)) {
      errores.push(`Transición ${numero}: el estado de origen no existe.`);
    }

    if (transicion.simbolo !== 'ε' && !alfabeto.has(transicion.simbolo)) {
      errores.push(`Transición ${numero}: selecciona un símbolo válido.`);
    }

    if (transicion.destinos.length === 0) {
      errores.push(`Transición ${numero}: selecciona al menos un destino.`);
    }

    if (transicion.destinos.some((destino) => !estados.has(destino))) {
      errores.push(`Transición ${numero}: todos los destinos deben existir.`);
    }

    if (new Set(transicion.destinos).size !== transicion.destinos.length) {
      errores.push(`Transición ${numero}: los destinos no pueden repetirse.`);
    }

    const clave = JSON.stringify([
      transicion.origen,
      transicion.simbolo,
    ]);

    if (paresTransiciones.has(clave)) {
      errores.push(
        `Transición ${numero}: el par origen y símbolo ya existe. Agrupa sus destinos en una sola fila.`,
      );
    }

    paresTransiciones.add(clave);
  });

  for (const simbolo of entrada.cadena) {
    if (!alfabeto.has(simbolo)) {
      errores.push(
        `El símbolo "${simbolo}" de la cadena no pertenece al alfabeto.`,
      );

      break;
    }
  }

  return errores;
}