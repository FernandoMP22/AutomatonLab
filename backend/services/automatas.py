from backend.algoritmos.conversion import convertir_afnde_a_afd
from backend.algoritmos.recorrido import simular_afd_con_recorrido
from backend.algoritmos.simulacion import simular_afnde
from backend.modelos.afnde import AFNDE
from backend.schemas.automata import AutomataEntrada
from backend.schemas.recorrido import PasoAFDSalida
from backend.schemas.resultado import ResultadoAnalisis
from backend.services.serializacion import serializar_afd


def crear_afnde(entrada: AutomataEntrada) -> AFNDE:
    transiciones = {}

    for transicion in entrada.transiciones:
        clave = (transicion.origen, transicion.simbolo)
        destinos = set(transicion.destinos)

        transiciones[clave] = destinos

    return AFNDE(
        estados=set(entrada.estados),
        alfabeto=set(entrada.alfabeto),
        transiciones=transiciones,
        estado_inicial=entrada.estado_inicial,
        estados_finales=set(entrada.estados_finales),
    )


def analizar_automata(entrada: AutomataEntrada) -> ResultadoAnalisis:
    afnde = crear_afnde(entrada)

    afd_salida = None
    recorrido_salida = None

    if entrada.metodo == "afnde":
        aceptada = simular_afnde(afnde, entrada.cadena)

    else:
        afd = convertir_afnde_a_afd(afnde)
        resultado = simular_afd_con_recorrido(afd, entrada.cadena)

        aceptada = resultado["aceptada"]
        afd_salida = serializar_afd(afd)

        # Relacionar los estados internos con los identificadores de salida.
        identificadores = {}

        for estado in afd_salida.estados:
            componentes = frozenset(estado.componentes)
            identificadores[componentes] = estado.id

        # Transformar los pasos internos a schemas de salida.
        recorrido_salida = []

        for paso in resultado["pasos"]:
            estado_id = None

            if paso["estado"] is not None:
                estado_id = identificadores[paso["estado"]]

            recorrido_salida.append(
                PasoAFDSalida(
                    posicion=paso["posicion"],
                    simbolo=paso["simbolo"],
                    estado=estado_id,
                )
            )

    return ResultadoAnalisis(
        cadena=entrada.cadena,
        metodo=entrada.metodo,
        aceptada=aceptada,
        afd=afd_salida,
        recorrido_afd=recorrido_salida,
    )