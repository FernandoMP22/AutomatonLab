from backend.modelos.afnde import AFNDE, EPSILON
from backend.algoritmos.epsilon_closure import epsilon_closure


estados = {"q0", "q1", "q2"}

alfabeto = {"0", "1"}

transiciones = {
    ("q0", EPSILON): {"q1"},
    ("q1", EPSILON): {"q2"},
}

automata = AFNDE(
    estados,
    alfabeto,
    transiciones,
    "q0",
    {"q2"}
)


resultado = epsilon_closure(automata, {"q0"})

print("ε-clausura de q0:", resultado)

assert resultado == {"q0", "q1", "q2"}

print("Prueba de ε-clausura correcta.")