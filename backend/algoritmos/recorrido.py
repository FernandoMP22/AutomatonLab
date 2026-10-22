from backend.algoritmos.epsilon_closure import epsilon_closure
from backend.algoritmos.move import move


def simular_afd_con_recorrido(afd, cadena):
    estado_actual = afd.estado_inicial

    pasos = [
        {
            "posicion": 0,
            "simbolo": None,
            "estado": estado_actual,
        }
    ]

    for posicion, simbolo in enumerate(cadena, start=1):
        if simbolo not in afd.alfabeto:
            raise ValueError(
                f"El símbolo '{simbolo}' no pertenece al alfabeto."
            )

        destinos = afd.transiciones.get(
            (estado_actual, simbolo)
        )

        if destinos is None:
            pasos.append(
                {
                    "posicion": posicion,
                    "simbolo": simbolo,
                    "estado": None,
                }
            )

            return {
                "aceptada": False,
                "pasos": pasos,
            }

        estado_actual = next(iter(destinos))

        pasos.append(
            {
                "posicion": posicion,
                "simbolo": simbolo,
                "estado": estado_actual,
            }
        )

    return {
        "aceptada": estado_actual in afd.estados_finales,
        "pasos": pasos,
    }


def simular_afnde_con_recorrido(afnde, cadena):
    estados_actuales = epsilon_closure(
        afnde,
        {afnde.estado_inicial},
    )

    pasos = [
        {
            "posicion": 0,
            "simbolo": None,
            "estados": estados_actuales.copy(),
        }
    ]

    for posicion, simbolo in enumerate(cadena, start=1):
        if simbolo not in afnde.alfabeto:
            raise ValueError(
                f"El símbolo '{simbolo}' no pertenece al alfabeto."
            )

        estados_movidos = move(
            afnde,
            estados_actuales,
            simbolo,
        )

        estados_actuales = epsilon_closure(
            afnde,
            estados_movidos,
        )

        pasos.append(
            {
                "posicion": posicion,
                "simbolo": simbolo,
                "estados": estados_actuales.copy(),
            }
        )

    return {
        "aceptada": bool(
            estados_actuales.intersection(afnde.estados_finales)
        ),
        "pasos": pasos,
    }