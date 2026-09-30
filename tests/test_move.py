from backend.modelos.afnde import AFNDE, EPSILON
from backend.algoritmos.move import move


estados = {"q0", "q1", "q2"}

alfabeto = {"0", "1"}

transiciones = {
    ("q0", "0"): {"q1", "q2"},
    ("q1", "0"): {"q2"},
    ("q1", "1"): {"q0"},
    ("q0", EPSILON): {"q1"},
}

automata = AFNDE(
    estados,
    alfabeto,
    transiciones,
    "q0",
    {"q2"}
)


resultado = move(automata, {"q0"}, "0")

print("move({q0}, 0):", resultado)

assert resultado == {"q1", "q2"}


resultado = move(automata, {"q0", "q1"}, "0")

print("move({q0, q1}, 0):", resultado)

assert resultado == {"q1", "q2"}

print("Pruebas de move() correctas.")