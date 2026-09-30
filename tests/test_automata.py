from backend.modelos.automata import Automata


automata = Automata(
    {"q0", "q1", "q2"},
    {"0", "1"},
    {},
    "q0",
    {"q2"}
)

print("Modelo base Automata creado correctamente.")
print("Estados:", automata.estados)
print("Alfabeto:", automata.alfabeto)
print("Estado inicial:", automata.estado_inicial)
print("Estados finales:", automata.estados_finales)