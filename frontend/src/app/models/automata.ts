export type MetodoAnalisis = 'afnde' | 'afd';

export interface TransicionEntrada {
  origen: string;
  simbolo: string;
  destinos: string[];
}

export interface AutomataEntrada {
  numero_nodos: number;
  estados: string[];
  alfabeto: string[];
  estado_inicial: string;
  estados_finales: string[];
  transiciones: TransicionEntrada[];
  cadena: string;
  metodo: MetodoAnalisis;
}

export interface EstadoAFDSalida {
  id: string;
  componentes: string[];
}

export interface TransicionAFDSalida {
  origen: string;
  simbolo: string;
  destino: string;
}

export interface AFDSalida {
  estados: EstadoAFDSalida[];
  alfabeto: string[];
  estado_inicial: string;
  estados_finales: string[];
  transiciones: TransicionAFDSalida[];
  estado_trampa: string | null;
}

export interface PasoAFDSalida {
  posicion: number;
  simbolo: string | null;
  estado: string | null;
}

export interface PasoAFNDESalida {
  posicion: number;
  simbolo: string | null;
  estados: string[];
}

export interface ResultadoAnalisis {
  cadena: string;
  metodo: MetodoAnalisis;
  aceptada: boolean;
  afd: AFDSalida | null;
  recorrido_afd: PasoAFDSalida[] | null;
  recorrido_afnde: PasoAFNDESalida[] | null;
}