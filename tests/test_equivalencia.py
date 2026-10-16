from backend.modelos.afnde import AFNDE, EPSILON
from backend.algoritmos.conversion import convertir_afnde_a_afd
from backend.algoritmos.simulacion import simular_afnde, simular_afd


afnde = AFNDE(
    {"q0", "q1", "q2"},
    {"0", "1"},
    {
        ("q0", EPSILON): {"q1"},
        ("q1", "0"): {"q2"},
    },
    "q0",
    {"q2"}
)


afd = convertir_afnde_a_afd(afnde)


cadenas = [
    "",
    "0",
    "1",
    "00",
    "01",
    "10",
    "11",
]


for cadena in cadenas:
    resultado_afnde = simular_afnde(
        afnde,
        cadena
    )

    resultado_afd = simular_afd(
        afd,
        cadena
    )

    print(
        f"Cadena '{cadena}': "
        f"AFND-ε={resultado_afnde}, "
        f"AFD={resultado_afd}"
    )

    assert resultado_afnde == resultado_afd


print("AFND-ε y AFD son equivalentes para las cadenas probadas.")