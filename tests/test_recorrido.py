from backend.algoritmos.conversion import convertir_afnde_a_afd
from backend.algoritmos.recorrido import simular_afd_con_recorrido
from backend.algoritmos.simulacion import simular_afd
from backend.modelos.afd import AFD
from backend.modelos.afnde import AFNDE, EPSILON


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


# Comprobar un recorrido completo conocido.
resultado = simular_afd_con_recorrido(afd, "00")

assert resultado == {
    "aceptada": False,
    "pasos": [
        {
            "posicion": 0,
            "simbolo": None,
            "estado": frozenset({"q0", "q1"}),
        },
        {
            "posicion": 1,
            "simbolo": "0",
            "estado": frozenset({"q2"}),
        },
        {
            "posicion": 2,
            "simbolo": "0",
            "estado": frozenset(),
        },
    ],
}

print("Recorrido inicial, estado final y estado trampa: correcto.")


# Comparar el resultado con la simulacion original.
for cadena in ("", "0", "1", "00", "01", "10", "11"):
    resultado = simular_afd_con_recorrido(afd, cadena)

    assert resultado["aceptada"] == simular_afd(afd, cadena)
    assert len(resultado["pasos"]) == len(cadena) + 1
    assert resultado["pasos"][-1]["posicion"] == len(cadena)

print("Coincidencia con la simulacion original: correcto.")


# Comprobar la aceptacion de una cadena vacia.
afd_vacio_aceptado = AFD(
    estados={"q0"},
    alfabeto={"0"},
    transiciones={
        ("q0", "0"): {"q0"},
    },
    estado_inicial="q0",
    estados_finales={"q0"},
)

resultado = simular_afd_con_recorrido(afd_vacio_aceptado, "")

assert resultado["aceptada"] is True
assert resultado["pasos"] == [
    {
        "posicion": 0,
        "simbolo": None,
        "estado": "q0",
    }
]

print("Cadena vacia aceptada: correcto.")


# Comprobar el rechazo cuando falta una transicion.
afd_parcial = AFD(
    estados={"q0"},
    alfabeto={"0"},
    transiciones={},
    estado_inicial="q0",
    estados_finales=set(),
)

resultado = simular_afd_con_recorrido(afd_parcial, "0")

assert resultado["aceptada"] is False
assert resultado["pasos"][-1] == {
    "posicion": 1,
    "simbolo": "0",
    "estado": None,
}

print("Transicion ausente: correcto.")


# Comprobar el rechazo de simbolos ajenos al alfabeto.
try:
    simular_afd_con_recorrido(afd, "2")

except ValueError as error:
    assert "no pertenece al alfabeto" in str(error)

else:
    raise AssertionError(
        "Se acepto un simbolo ajeno al alfabeto."
    )

print("Simbolo fuera del alfabeto: correcto.")
print("Todas las pruebas del recorrido AFD pasaron.")