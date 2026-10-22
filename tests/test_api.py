from copy import deepcopy

from fastapi.testclient import TestClient

from backend.main import app
from backend.schemas.afd import AFDSalida


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


def comprobar_respuesta(respuesta, cadena, metodo, aceptada):
    assert respuesta.status_code == 200, respuesta.text

    contenido = respuesta.json()

    assert set(contenido) == {
        "cadena",
        "metodo",
        "aceptada",
        "afd",
        "recorrido_afd",
        "recorrido_afnde",
    }

    assert contenido["cadena"] == cadena
    assert contenido["metodo"] == metodo
    assert contenido["aceptada"] is aceptada

    # Estados activos esperados para el automata de estas pruebas.
    componentes_esperados = {
        "": [("q0", "q1")],
        "0": [("q0", "q1"), ("q2",)],
        "1": [("q0", "q1"), ()],
        "00": [("q0", "q1"), ("q2",), ()],
    }

    if metodo == "afnde":
        assert contenido["afd"] is None
        assert contenido["recorrido_afd"] is None

        recorrido = contenido["recorrido_afnde"]
        pasos_esperados = []

        for posicion, componentes in enumerate(
            componentes_esperados[cadena]
        ):
            simbolo = None

            if posicion > 0:
                simbolo = cadena[posicion - 1]

            pasos_esperados.append(
                {
                    "posicion": posicion,
                    "simbolo": simbolo,
                    "estados": list(componentes),
                }
            )

        assert recorrido == pasos_esperados

    else:
        assert contenido["recorrido_afnde"] is None

        afd = AFDSalida.model_validate(contenido["afd"])

        assert afd.estado_inicial == "D0"
        assert afd.estados[0].componentes == ["q0", "q1"]
        assert afd.alfabeto == ["0", "1"]

        por_componentes = {
            tuple(estado.componentes): estado.id
            for estado in afd.estados
        }

        assert afd.estado_trampa == por_componentes[()]
        assert len(afd.transiciones) == len(afd.estados) * len(afd.alfabeto)

        recorrido = contenido["recorrido_afd"]

        assert len(recorrido) == len(cadena) + 1

        assert recorrido[0] == {
            "posicion": 0,
            "simbolo": None,
            "estado": afd.estado_inicial,
        }

        estados_esperados = [
            por_componentes[componentes]
            for componentes in componentes_esperados[cadena]
        ]

        assert [paso["estado"] for paso in recorrido] == estados_esperados

        for posicion, simbolo in enumerate(cadena, start=1):
            assert recorrido[posicion]["posicion"] == posicion
            assert recorrido[posicion]["simbolo"] == simbolo

        estado_final = recorrido[-1]["estado"]

        assert (estado_final in afd.estados_finales) is aceptada

with TestClient(app) as cliente:
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

            comprobar_respuesta(
                respuesta,
                cadena,
                metodo,
                resultado_esperado,
            )

    print("Analisis y recorrido con ambos metodos: correcto.")

    # Comprobar aceptacion de la cadena vacia mediante epsilon.
    for metodo in ("afnde", "afd"):
        datos = deepcopy(datos_validos)
        datos["estados_finales"] = ["q1"]
        datos["cadena"] = ""
        datos["metodo"] = metodo

        respuesta = cliente.post(
            "/automatas/analizar",
            json=datos,
        )

        comprobar_respuesta(respuesta, "", metodo, True)

        if metodo == "afd":
            contenido_afd = respuesta.json()["afd"]
            assert "D0" in contenido_afd["estados_finales"]

    print("Aceptacion de cadena vacia mediante epsilon: correcto.")

    # Comprobar solicitudes invalidas.
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
        assert "detail" in respuesta.json()
        assert mensaje_esperado in respuesta.text, respuesta.text

    print("Errores de entrada con HTTP 422: correcto.")


print("Todas las pruebas de la API pasaron.")