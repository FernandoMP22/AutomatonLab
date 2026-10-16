from fastapi import APIRouter

from backend.schemas.automata import AutomataEntrada
from backend.schemas.resultado import ResultadoAnalisis
from backend.services.automatas import analizar_automata


router = APIRouter(
    prefix="/automatas",
    tags=["Automatas"],
)


@router.post("/analizar", response_model=ResultadoAnalisis)
def analizar(entrada: AutomataEntrada):
    return analizar_automata(entrada)