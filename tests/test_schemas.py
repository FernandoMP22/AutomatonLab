from copy import deepcopy

from pydantic import ValidationError

from backend.schemas.automata import AutomataEntrada, TransicionEntrada


datos_validos = {
    "numero_nodos": 3,
    "estados": ["q0", "q1", "q2"],
    "alfabeto": ["0", "1"],
    "estado_inicial": "q0",
    "estados_finales": ["q2"],
    "transiciones": [
        {
            "origen": "q0",
            "simbolo": "ε",
            "destinos": ["q1"],
        },
        {
            "origen": "q1",
            "simbolo": "0",
            "destinos": ["q2"],
        },
    ],
    "cadena": "0",
    "metodo": "afnde",
}


# Probar datos validos y ambos metodos.
for metodo in ("afnde", "afd"):
    datos = deepcopy(datos_validos)
    datos["metodo"] = metodo

    entrada = AutomataEntrada.model_validate(datos)

    assert entrada.numero_nodos == 3
    assert entrada.metodo == metodo
    assert isinstance(entrada.transiciones[0], TransicionEntrada)
    assert entrada.transiciones[0].origen == "q0"

print("Datos validos y ambos metodos: correcto.")


# Probar cadena vacia, sin finales y sin transiciones.
datos = deepcopy(datos_validos)
datos["cadena"] = ""
datos["estados_finales"] = []
datos["transiciones"] = []

entrada = AutomataEntrada.model_validate(datos)

assert entrada.cadena == ""
assert entrada.estados_finales == []
assert entrada.transiciones == []

print("Cadena vacia, sin finales y sin transiciones: correcto.")


def comprobar_rechazo(cambios, mensaje_esperado):
    datos = deepcopy(datos_validos)
    datos.update(cambios)

    try:
        AutomataEntrada.model_validate(datos)

    except ValidationError as error:
        assert mensaje_esperado in str(error), (
            f"Se esperaba otro error: {mensaje_esperado}\n"
            f"Error recibido: {error}"
        )

    else:
        raise AssertionError(
            f"Se aceptaron datos que debian rechazarse: {cambios}"
        )


# Probar las reglas de estados.
comprobar_rechazo(
    {"estados": ["q0", " ", "q2"]},
    "Los nombres de los estados no pueden estar vacios.",
)

comprobar_rechazo(
    {"estados": ["q0", "q0", "q2"]},
    "La lista de estados no puede contener nombres repetidos.",
)

comprobar_rechazo(
    {"numero_nodos": 4},
    "El numero de nodos debe coincidir",
)

comprobar_rechazo(
    {"estado_inicial": "q9"},
    "El estado inicial debe pertenecer",
)

comprobar_rechazo(
    {"estados_finales": ["q2", "q2"]},
    "La lista de estados finales no puede contener repetidos.",
)

comprobar_rechazo(
    {"estados_finales": ["q9"]},
    "Todos los estados finales deben pertenecer",
)

print("Validaciones de estados: correcto.")


# Probar las reglas del alfabeto.
comprobar_rechazo(
    {"alfabeto": ["0", "0"]},
    "El alfabeto no puede contener simbolos repetidos.",
)

comprobar_rechazo(
    {"alfabeto": ["0", "ab"]},
    "Cada simbolo del alfabeto debe tener un solo caracter.",
)

comprobar_rechazo(
    {"alfabeto": ["0", "ε"]},
    "epsilon no puede formar parte del alfabeto.",
)

print("Validaciones del alfabeto: correcto.")


# Probar las reglas de las transiciones.
comprobar_rechazo(
    {
        "transiciones": [
            {"origen": "q9", "simbolo": "0", "destinos": ["q1"]}
        ]
    },
    "El estado origen 'q9' no existe.",
)

comprobar_rechazo(
    {
        "transiciones": [
            {"origen": "q0", "simbolo": "2", "destinos": ["q1"]}
        ]
    },
    "El simbolo '2' no pertenece al alfabeto.",
)

comprobar_rechazo(
    {
        "transiciones": [
            {"origen": "q0", "simbolo": "0", "destinos": ["q1", "q1"]}
        ]
    },
    "Una transicion contiene destinos repetidos.",
)

comprobar_rechazo(
    {
        "transiciones": [
            {"origen": "q0", "simbolo": "0", "destinos": ["q9"]}
        ]
    },
    "Una transicion contiene estados destino que no existen.",
)

comprobar_rechazo(
    {
        "transiciones": [
            {"origen": "q0", "simbolo": "0", "destinos": ["q1"]},
            {"origen": "q0", "simbolo": "0", "destinos": ["q2"]},
        ]
    },
    "Cada par (origen, simbolo) debe aparecer una sola vez.",
)

print("Validaciones de transiciones: correcto.")


# Probar una cadena con un simbolo ajeno al alfabeto.
comprobar_rechazo(
    {"cadena": "02"},
    "El simbolo '2' de la cadena no pertenece al alfabeto.",
)

print("Validacion de cadena: correcto.")
print("Todas las pruebas de reglas del schema pasaron.")