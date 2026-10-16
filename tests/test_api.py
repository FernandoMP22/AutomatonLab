from copy import deepcopy

from fastapi.testclient import TestClient

from backend.main import app


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


with TestClient(app) as cliente:
    # Probar cadenas aceptadas y rechazadas con ambos metodos.
    casos = [
        ("0", True),
        ("1", False),
        ("", False),
        ("00", False),
    ]

    for metodo in ("afnde", "afd"):
        for cadena, resultado_esperado in casos:
            datos = deepcopy(datos_validos)
            datos["cadena"] = cadena
            datos["metodo"] = metodo

            respuesta = cliente.post(
                "/automatas/analizar",
                json=datos,
            )

            assert respuesta.status_code == 200, respuesta.text

            assert respuesta.json() == {
                "cadena": cadena,
                "metodo": metodo,
                "aceptada": resultado_esperado,
            }

    print("Aceptacion y rechazo con ambos metodos: correcto.")

    # Probar aceptacion de la cadena vacia mediante epsilon.
    for metodo in ("afnde", "afd"):
        datos = deepcopy(datos_validos)
        datos["estados_finales"] = ["q1"]
        datos["cadena"] = ""
        datos["metodo"] = metodo

        respuesta = cliente.post(
            "/automatas/analizar",
            json=datos,
        )

        assert respuesta.status_code == 200, respuesta.text

        assert respuesta.json() == {
            "cadena": "",
            "metodo": metodo,
            "aceptada": True,
        }

    print("Aceptacion de cadena vacia mediante epsilon: correcto.")

    # Probar errores en las reglas y en los tipos de entrada.
    casos_invalidos = [
        (
            {"cadena": "2"},
            "El simbolo '2' de la cadena no pertenece al alfabeto.",
        ),
        (
            {"numero_nodos": 4},
            "El numero de nodos debe coincidir",
        ),
        (
            {"metodo": "otro"},
            "literal_error",
        ),
        (
            {"estados": "q0"},
            "list_type",
        ),
    ]

    for cambios, mensaje_esperado in casos_invalidos:
        datos = deepcopy(datos_validos)
        datos.update(cambios)

        respuesta = cliente.post(
            "/automatas/analizar",
            json=datos,
        )

        assert respuesta.status_code == 422, respuesta.text

        contenido = respuesta.json()

        assert "detail" in contenido
        assert mensaje_esperado in respuesta.text, respuesta.text

    print("Errores de entrada con HTTP 422: correcto.")


print("Todas las pruebas de la API pasaron.")