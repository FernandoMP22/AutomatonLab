from typing import Literal

from pydantic import BaseModel

from backend.schemas.afd import AFDSalida
from backend.schemas.recorrido import PasoAFDSalida, PasoAFNDESalida


class ResultadoAnalisis(BaseModel):
    cadena: str
    metodo: Literal["afnde", "afd"]
    aceptada: bool
    afd: AFDSalida | None = None
    recorrido_afd: list[PasoAFDSalida] | None = None
    recorrido_afnde: list[PasoAFNDESalida] | None = None