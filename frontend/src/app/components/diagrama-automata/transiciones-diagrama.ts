import type { TransicionEntrada } from '../../models/automata';

export interface ConexionDiagrama {
  origen: string;
  destino: string;
  simbolos: string[];
}

// Agrupa únicamente el dibujo. Las transiciones del formulario no se modifican.
export function agruparTransiciones(transiciones: TransicionEntrada[]): ConexionDiagrama[] {
  const conexiones = new Map<string, ConexionDiagrama>();

  for (const transicion of transiciones) {
    for (const destino of transicion.destinos) {
      const clave = JSON.stringify([transicion.origen, destino]);
      let conexion = conexiones.get(clave);

      if (!conexion) {
        conexion = { origen: transicion.origen, destino, simbolos: [] };
        conexiones.set(clave, conexion);
      }

      if (!conexion.simbolos.includes(transicion.simbolo)) {
        conexion.simbolos.push(transicion.simbolo);
      }
    }
  }

  return [...conexiones.values()];
}
