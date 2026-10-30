import type { AutomataEntrada } from '../models/automata';
import { validarAutomata } from './automata';

function esObjeto(
  valor: unknown,
): valor is Record<string, unknown> {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    !Array.isArray(valor)
  );
}

function esListaDeTextos(valor: unknown): valor is string[] {
  return (
    Array.isArray(valor) &&
    valor.every(
      (elemento: unknown) => typeof elemento === 'string',
    )
  );
}

function esAutomataEntrada(
  valor: unknown,
): valor is AutomataEntrada {
  if (!esObjeto(valor)) {
    return false;
  }

  return (
    typeof valor['numero_nodos'] === 'number' &&
    esListaDeTextos(valor['estados']) &&
    esListaDeTextos(valor['alfabeto']) &&
    typeof valor['estado_inicial'] === 'string' &&
    esListaDeTextos(valor['estados_finales']) &&
    typeof valor['cadena'] === 'string' &&
    (
      valor['metodo'] === 'afd' ||
      valor['metodo'] === 'afnde'
    ) &&
    Array.isArray(valor['transiciones']) &&
    valor['transiciones'].every(
      (transicion: unknown) =>
        esObjeto(transicion) &&
        typeof transicion['origen'] === 'string' &&
        typeof transicion['simbolo'] === 'string' &&
        esListaDeTextos(transicion['destinos']),
    )
  );
}

export function leerAutomata(texto: string): AutomataEntrada {
  let datos: unknown;

  try {
    datos = JSON.parse(texto);
  } catch {
    throw new Error(
      'El texto no contiene un JSON válido.',
    );
  }

  if (!esAutomataEntrada(datos)) {
    throw new Error(
      'El ejemplo no tiene los campos y tipos requeridos por la API.',
    );
  }

  const errores = validarAutomata(datos);

  if (errores.length > 0) {
    throw new Error(errores.join('\n'));
  }

  const estadosIncompatibles = datos.estados.some(
    (estado) =>
      estado.includes(',') ||
      estado !== estado.trim(),
  );

  const simbolosIncompatibles = datos.alfabeto.some(
    (simbolo) =>
      simbolo === ',' ||
      simbolo !== simbolo.trim() ||
      simbolo.trim().length === 0,
  );

  if (estadosIncompatibles || simbolosIncompatibles) {
    throw new Error(
      'El editor no admite comas ni espacios exteriores en estados o símbolos.',
    );
  }

  return datos;
}