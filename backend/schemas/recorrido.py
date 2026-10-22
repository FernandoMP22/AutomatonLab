from pydantic import BaseModel


class PasoAFDSalida(BaseModel):
    posicion: int
    simbolo: str | None
    estado: str | None


class PasoAFNDESalida(BaseModel):
    posicion: int
    simbolo: str | None
    estados: list[str]