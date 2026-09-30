from backend.modelos.afnde import EPSILON


def move(automata, estados, simbolo):
    if simbolo == EPSILON:
        raise ValueError("move() no puede utilizar ε.")

    if simbolo not in automata.alfabeto:
        raise ValueError(
            f"El símbolo '{simbolo}' no pertenece al alfabeto."
        )

    destinos = set()

    for estado in estados:
        destinos.update(
            automata.transiciones.get(
                (estado, simbolo),
                set()
            )
        )

    return destinos