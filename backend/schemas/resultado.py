from typing import Literal

from pydantic import BaseModel


class ResultadoAnalisis(BaseModel):
    cadena: str
    metodo: Literal["afnde", "afd"]
    aceptada: bool