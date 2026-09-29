from backend.modelos.automata import Automata, EPSILON


estados = {"q0", "q1", "q2"}

alfabeto = {"0", "1"}

transiciones = {
    ("q0", "0"): {"q1", "q2"},
    ("q0", "1"): {"q2"},
    ("q0", EPSILON): {"q1"},
    ("q1", "0"): {"q1"},
    ("q1", EPSILON): {"q2"},
}

automata = Automata(
    estados,
    alfabeto,
    transiciones,
    "q0",
    {"q2"}
)

print("Estados:", automata.estados)
print("Alfabeto:", automata.alfabeto)
print("Estado inicial:", automata.estado_inicial)
print("Estados finales:", automata.estados_finales)
print("Transiciones:", automata.transiciones)

automata_invalido = Automata(
    estados,
    alfabeto,
    {
        ("q0", "2"): {"q1"}
    },
    "q0",
    {"q2"}
)