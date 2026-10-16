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