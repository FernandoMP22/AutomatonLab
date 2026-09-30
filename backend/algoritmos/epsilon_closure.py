from backend.modelos.afnde import EPSILON


def epsilon_closure(automata, estados):
    clausura = set(estados)
    pendientes = list(estados)

    while pendientes:
        estado = pendientes.pop()

        destinos = automata.transiciones.get(
            (estado, EPSILON),
            set()
        )

        for destino in destinos:
            if destino not in clausura:
                clausura.add(destino)
                pendientes.append(destino)

    return clausura