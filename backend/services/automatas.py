from backend.algoritmos.conversion import convertir_afnde_a_afd
from backend.algoritmos.simulacion import simular_afd, simular_afnde
from backend.modelos.afnde import AFNDE
from backend.schemas.automata import AutomataEntrada
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

    if entrada.metodo == "afnde":
        aceptada = simular_afnde(afnde, entrada.cadena)

    else:
        afd = convertir_afnde_a_afd(afnde)
        aceptada = simular_afd(afd, entrada.cadena)
        afd_salida = serializar_afd(afd)

    return ResultadoAnalisis(
        cadena=entrada.cadena,
        metodo=entrada.metodo,
        aceptada=aceptada,
        afd=afd_salida,
    )