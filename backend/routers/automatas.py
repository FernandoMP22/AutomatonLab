from typing import Annotated

from fastapi import APIRouter, Body

from backend.schemas.automata import AutomataEntrada
from backend.schemas.resultado import ResultadoAnalisis
from backend.services.automatas import analizar_automata


router = APIRouter(
    prefix="/automatas",
    tags=["Automatas"],
)


EJEMPLO_ANALISIS = {
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
    "metodo": "afd",
}


@router.post("/analizar", response_model=ResultadoAnalisis)
def analizar(
    entrada: Annotated[
        AutomataEntrada,
        Body(
            openapi_examples={
                "conversion_y_simulacion": {
                    "summary": "Convertir a AFD y analizar una cadena",
                    "value": EJEMPLO_ANALISIS,
                }
            }
        ),
    ],
):
    return analizar_automata(entrada)