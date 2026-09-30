from backend.modelos.afnde import AFNDE, EPSILON
from backend.algoritmos.conversion import convertir_afnde_a_afd
from backend.algoritmos.simulacion import simular_afd


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


estado_inicial_esperado = frozenset({"q0", "q1"})
estado_final_esperado = frozenset({"q2"})
estado_trampa = frozenset()


assert afd.estado_inicial == estado_inicial_esperado

assert estado_inicial_esperado in afd.estados
assert estado_final_esperado in afd.estados
assert estado_trampa in afd.estados

assert estado_final_esperado in afd.estados_finales

assert afd.transiciones[
    (estado_inicial_esperado, "0")
] == {estado_final_esperado}

assert afd.transiciones[
    (estado_inicial_esperado, "1")
] == {estado_trampa}


resultado = simular_afd(afd, "0")

print("Cadena '0':", resultado)

assert resultado is True


resultado = simular_afd(afd, "1")

print("Cadena '1':", resultado)

assert resultado is False


print("Conversión y simulación correctas.")