from backend.algoritmos.conversion import convertir_afnde_a_afd
from backend.modelos.afnde import AFNDE, EPSILON
from backend.schemas.afd import AFDSalida
from backend.services.serializacion import serializar_afd


afnde = AFNDE(
    estados={"q0", "q1", "q2"},
    alfabeto={"0", "1"},
    transiciones={
        ("q0", EPSILON): {"q1"},
        ("q1", "0"): {"q2"},
    },
    estado_inicial="q0",
    estados_finales={"q2"},
)

afd = convertir_afnde_a_afd(afnde)
salida = serializar_afd(afd)


# Comprobar el estado inicial y sus componentes.
assert salida.estado_inicial == "D0"
assert salida.estados[0].componentes == ["q0", "q1"]

# Comprobar que se conservaron todos los estados.
assert len(salida.estados) == len(afd.estados)

componentes = {
    frozenset(estado.componentes)
    for estado in salida.estados
}

assert componentes == afd.estados


# Comprobar el estado final y el estado trampa.
por_componentes = {
    tuple(estado.componentes): estado.id
    for estado in salida.estados
}

assert salida.estados_finales == [por_componentes[("q2",)]]
assert salida.estado_trampa == por_componentes[()]


# Comprobar que se conservaron todas las transiciones.
identificadores = {
    frozenset(estado.componentes): estado.id
    for estado in salida.estados
}

transiciones_esperadas = {
    (
        identificadores[origen],
        simbolo,
        identificadores[next(iter(destinos))],
    )
    for (origen, simbolo), destinos in afd.transiciones.items()
}

transiciones_obtenidas = {
    (transicion.origen, transicion.simbolo, transicion.destino)
    for transicion in salida.transiciones
}

assert transiciones_obtenidas == transiciones_esperadas


# Comprobar que puede convertirse a JSON y recuperarse.
texto_json = salida.model_dump_json(indent=2)

assert AFDSalida.model_validate_json(texto_json) == salida


# Comprobar un AFD que no necesita estado trampa.
afnde_sin_trampa = AFNDE(
    estados={"q0"},
    alfabeto={"0"},
    transiciones={
        ("q0", "0"): {"q0"},
    },
    estado_inicial="q0",
    estados_finales={"q0"},
)

afd_sin_trampa = convertir_afnde_a_afd(afnde_sin_trampa)
salida_sin_trampa = serializar_afd(afd_sin_trampa)

assert salida_sin_trampa.estado_trampa is None


print(texto_json)
print("Estados, componentes y transiciones conservados.")
print("Estado trampa presente o ausente: correcto.")
print("Conversion a JSON y recuperacion: correcto.")
print("Todas las pruebas de serializacion pasaron.")