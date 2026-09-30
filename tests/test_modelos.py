from backend.modelos.afnde import AFNDE, EPSILON
from backend.modelos.afd import AFD


afnde = AFNDE(
    {"q0", "q1", "q2"},
    {"0", "1"},
    {
        ("q0", "0"): {"q1", "q2"},
        ("q0", EPSILON): {"q1"},
        ("q1", "1"): {"q2"},
    },
    "q0",
    {"q2"}
)

print("AFND-ε creado correctamente.")


afd = AFD(
    {"A", "B"},
    {"0", "1"},
    {
        ("A", "0"): {"B"},
        ("A", "1"): {"A"},
        ("B", "0"): {"B"},
        ("B", "1"): {"A"},
    },
    "A",
    {"B"}
)

print("AFD creado correctamente.")