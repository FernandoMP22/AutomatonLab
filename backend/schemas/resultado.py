from typing import Literal

from pydantic import BaseModel

from backend.schemas.afd import AFDSalida


class ResultadoAnalisis(BaseModel):
    cadena: str
    metodo: Literal["afnde", "afd"]
    aceptada: bool
    afd: AFDSalida | None = None