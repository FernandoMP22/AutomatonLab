from backend.modelos.afnde import AFNDE, EPSILON
from backend.algoritmos.simulacion import simular_afnde


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


resultado = simular_afnde(afnde, "0")

print("Cadena '0':", resultado)

assert resultado is True


resultado = simular_afnde(afnde, "1")

print("Cadena '1':", resultado)

assert resultado is False


print("Pruebas de simulación AFND-ε correctas.")