from pydantic import BaseModel


class EstadoAFDSalida(BaseModel):
    id: str
    componentes: list[str]


class TransicionAFDSalida(BaseModel):
    origen: str
    simbolo: str
    destino: str


class AFDSalida(BaseModel):
    estados: list[EstadoAFDSalida]
    alfabeto: list[str]
    estado_inicial: str
    estados_finales: list[str]
    transiciones: list[TransicionAFDSalida]
    estado_trampa: str | None