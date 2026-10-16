from backend.algoritmos.epsilon_closure import epsilon_closure
from backend.algoritmos.move import move


def simular_afd(afd, cadena):
    estado_actual = afd.estado_inicial

    for simbolo in cadena:

        if simbolo not in afd.alfabeto:
            raise ValueError(
                f"El símbolo '{simbolo}' no pertenece al alfabeto."
            )

        transicion = afd.transiciones.get(
            (estado_actual, simbolo)
        )

        if transicion is None:
            return False

        estado_actual = next(iter(transicion))

    return estado_actual in afd.estados_finales


def simular_afnde(afnde, cadena):
    estados_actuales = epsilon_closure(
        afnde,
        {afnde.estado_inicial}
    )

    for simbolo in cadena:

        if simbolo not in afnde.alfabeto:
            raise ValueError(
                f"El símbolo '{simbolo}' no pertenece al alfabeto."
            )

        estados_movidos = move(
            afnde,
            estados_actuales,
            simbolo
        )

        estados_actuales = epsilon_closure(
            afnde,
            estados_movidos
        )

    return bool(
        estados_actuales.intersection(
            afnde.estados_finales
        )
    )