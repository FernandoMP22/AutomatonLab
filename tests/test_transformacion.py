from backend.modelos.afnde import AFNDE, EPSILON
from backend.schemas.automata import AutomataEntrada
from backend.services.automatas import crear_afnde


datos = {
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
            "destinos": ["q1", "q2"],
        },
    ],
    "cadena": "0",
    "metodo": "afnde",
}


entrada = AutomataEntrada.model_validate(datos)

afnde = crear_afnde(entrada)


# Comprobar el modelo construido.
assert isinstance(afnde, AFNDE)

assert afnde.estados == {"q0", "q1", "q2"}
assert afnde.alfabeto == {"0", "1"}
assert afnde.estado_inicial == "q0"
assert afnde.estados_finales == {"q2"}


# Comprobar la transformacion de las transiciones.
assert afnde.transiciones == {
    ("q0", EPSILON): {"q1"},
    ("q1", "0"): {"q1", "q2"},
}


# Comprobar que el schema conserva sus listas originales.
assert isinstance(entrada.estados, list)
assert isinstance(entrada.transiciones[0].destinos, list)


print("Modelo AFNDE construido correctamente.")
print("Listas convertidas a conjuntos correctamente.")
print("Transiciones epsilon y multiples destinos conservados.")
print("Los datos del schema no fueron modificados.")
print("Todas las pruebas de transformacion pasaron.")