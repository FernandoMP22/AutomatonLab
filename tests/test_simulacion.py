from backend.modelos.afd import AFD
from backend.algoritmos.simulacion import simular_afd


afd = AFD(
    {"A", "B", "C"},
    {"0", "1"},
    {
        ("A", "0"): {"B"},
        ("A", "1"): {"A"},
        ("B", "0"): {"B"},
        ("B", "1"): {"C"},
        ("C", "0"): {"C"},
        ("C", "1"): {"C"},
    },
    "A",
    {"C"}
)


resultado = simular_afd(afd, "01")

print("Cadena '01':", resultado)

assert resultado is True


resultado = simular_afd(afd, "00")

print("Cadena '00':", resultado)

assert resultado is False


print("Pruebas de simulación correctas.")