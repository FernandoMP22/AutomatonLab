from backend.algoritmos.epsilon_closure import epsilon_closure
from backend.algoritmos.move import move
from backend.modelos.afd import AFD


def convertir_afnde_a_afd(afnde):
    estado_inicial = frozenset(
        epsilon_closure(
            afnde,
            {afnde.estado_inicial}
        )
    )

    estados_afd = {estado_inicial}
    estados_pendientes = [estado_inicial]

    transiciones_afd = {}
    estados_finales_afd = set()

    while estados_pendientes:
        estado_actual = estados_pendientes.pop()

        for simbolo in afnde.alfabeto:

            estados_movidos = move(
                afnde,
                estado_actual,
                simbolo
            )

            nuevo_estado = frozenset(
                epsilon_closure(
                    afnde,
                    estados_movidos
                )
            )

            transiciones_afd[
                (estado_actual, simbolo)
            ] = {nuevo_estado}

            if nuevo_estado not in estados_afd:
                estados_afd.add(nuevo_estado)
                estados_pendientes.append(nuevo_estado)

    for estado in estados_afd:
        if estado.intersection(afnde.estados_finales):
            estados_finales_afd.add(estado)

    return AFD(
        estados_afd,
        afnde.alfabeto,
        transiciones_afd,
        estado_inicial,
        estados_finales_afd
    )