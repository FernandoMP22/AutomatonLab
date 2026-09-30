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