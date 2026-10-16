from backend.modelos.afd import AFD
from backend.schemas.afd import (
    AFDSalida,
    EstadoAFDSalida,
    TransicionAFDSalida,
)


def serializar_afd(afd: AFD) -> AFDSalida:
    # Esta funcion recibe el AFD producido por la conversion.
    # Sus estados son frozenset de nombres del AFND-epsilon.

    # Colocar primero el estado inicial y ordenar los restantes.
    estados_restantes = afd.estados - {afd.estado_inicial}

    estados_ordenados = [afd.estado_inicial] + sorted(
        estados_restantes,
        key=lambda estado: tuple(sorted(estado)),
    )

    # Asignar un identificador a cada estado.
    identificadores = {}

    for numero, estado in enumerate(estados_ordenados):
        identificadores[estado] = f"D{numero}"

    # Construir los estados de salida.
    estados_salida = []

    for estado in estados_ordenados:
        estados_salida.append(
            EstadoAFDSalida(
                id=identificadores[estado],
                componentes=sorted(estado),
            )
        )

    alfabeto = sorted(afd.alfabeto)

    # Construir las transiciones de salida.
    transiciones_salida = []

    for estado in estados_ordenados:
        for simbolo in alfabeto:
            destinos = afd.transiciones.get((estado, simbolo))

            if destinos is None:
                continue

            destino = next(iter(destinos))

            transiciones_salida.append(
                TransicionAFDSalida(
                    origen=identificadores[estado],
                    simbolo=simbolo,
                    destino=identificadores[destino],
                )
            )

    # Obtener los identificadores de los estados finales.
    estados_finales = []

    for estado in estados_ordenados:
        if estado in afd.estados_finales:
            estados_finales.append(identificadores[estado])

    return AFDSalida(
        estados=estados_salida,
        alfabeto=alfabeto,
        estado_inicial=identificadores[afd.estado_inicial],
        estados_finales=estados_finales,
        transiciones=transiciones_salida,
        estado_trampa=identificadores.get(frozenset()),
    )