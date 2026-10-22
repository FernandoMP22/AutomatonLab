from backend.algoritmos.conversion import convertir_afnde_a_afd
from backend.algoritmos.recorrido import simular_afnde_con_recorrido
from backend.algoritmos.simulacion import simular_afd, simular_afnde
from backend.modelos.afnde import AFNDE, EPSILON


afnde = AFNDE(
    estados={"q0", "q1", "q2", "q3"},
    alfabeto={"0", "1"},
    transiciones={
        ("q0", EPSILON): {"q1"},
        ("q1", "0"): {"q1", "q2"},
        ("q2", EPSILON): {"q3"},
    },
    estado_inicial="q0",
    estados_finales={"q3"},
)


# Comprobar epsilon inicial, multiples destinos y epsilon posterior.
resultado = simular_afnde_con_recorrido(afnde, "0")

assert resultado == {
    "aceptada": True,
    "pasos": [
        {
            "posicion": 0,
            "simbolo": None,
            "estados": {"q0", "q1"},
        },
        {
            "posicion": 1,
            "simbolo": "0",
            "estados": {"q1", "q2", "q3"},
        },
    ],
}

print("Epsilon inicial, multiples destinos y epsilon posterior: correcto.")


# Comprobar el recorrido cuando desaparecen todos los estados activos.
resultado = simular_afnde_con_recorrido(afnde, "10")

assert resultado["aceptada"] is False

assert resultado["pasos"] == [
    {
        "posicion": 0,
        "simbolo": None,
        "estados": {"q0", "q1"},
    },
    {
        "posicion": 1,
        "simbolo": "1",
        "estados": set(),
    },
    {
        "posicion": 2,
        "simbolo": "0",
        "estados": set(),
    },
]

print("Conjunto de estados activos vacio: correcto.")


# Comparar con la simulacion original y con el AFD equivalente.
afd = convertir_afnde_a_afd(afnde)

for cadena in ("", "0", "1", "00", "01", "10", "11"):
    resultado = simular_afnde_con_recorrido(afnde, cadena)

    assert resultado["aceptada"] == simular_afnde(afnde, cadena)
    assert resultado["aceptada"] == simular_afd(afd, cadena)
    assert len(resultado["pasos"]) == len(cadena) + 1

print("Coincidencia con AFND-epsilon y AFD equivalente: correcto.")


# Comprobar cadena vacia aceptada y un ciclo epsilon.
afnde_ciclo = AFNDE(
    estados={"q0", "q1"},
    alfabeto={"0"},
    transiciones={
        ("q0", EPSILON): {"q1"},
        ("q1", EPSILON): {"q0"},
    },
    estado_inicial="q0",
    estados_finales={"q1"},
)

resultado = simular_afnde_con_recorrido(afnde_ciclo, "")

assert resultado == {
    "aceptada": True,
    "pasos": [
        {
            "posicion": 0,
            "simbolo": None,
            "estados": {"q0", "q1"},
        }
    ],
}

print("Cadena vacia aceptada y ciclo epsilon: correcto.")


# Comprobar simbolos invalidos, incluso sin estados activos.
for cadena in ("2", "12"):
    try:
        simular_afnde_con_recorrido(afnde, cadena)

    except ValueError as error:
        assert "no pertenece al alfabeto" in str(error)

    else:
        raise AssertionError(
            f"Se acepto un simbolo ajeno al alfabeto en '{cadena}'."
        )

print("Simbolos fuera del alfabeto: correcto.")
print("Todas las pruebas del recorrido AFND-epsilon pasaron.")