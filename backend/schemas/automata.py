from typing import Literal

from pydantic import BaseModel, Field, model_validator

from backend.modelos.afnde import EPSILON


class TransicionEntrada(BaseModel):
    origen: str
    simbolo: str
    destinos: list[str] = Field(min_length=1)


class AutomataEntrada(BaseModel):
    numero_nodos: int = Field(gt=0)
    estados: list[str] = Field(min_length=1)
    alfabeto: list[str] = Field(min_length=1)
    estado_inicial: str
    estados_finales: list[str]
    transiciones: list[TransicionEntrada]
    cadena: str
    metodo: Literal["afnde", "afd"]

    @model_validator(mode="after")
    def validar_automata(self):
        # Validar los nombres de los estados.
        for estado in self.estados:
            if not estado.strip():
                raise ValueError(
                    "Los nombres de los estados no pueden estar vacios."
                )

        # Validar que los estados no se repitan.
        if len(self.estados) != len(set(self.estados)):
            raise ValueError(
                "La lista de estados no puede contener nombres repetidos."
            )

        # Validar la cantidad de nodos.
        if self.numero_nodos != len(self.estados):
            raise ValueError(
                "El numero de nodos debe coincidir con la cantidad de estados."
            )

        # Validar el estado inicial.
        if self.estado_inicial not in self.estados:
            raise ValueError(
                "El estado inicial debe pertenecer a la lista de estados."
            )

        # Validar que los estados finales no se repitan.
        if len(self.estados_finales) != len(set(self.estados_finales)):
            raise ValueError(
                "La lista de estados finales no puede contener repetidos."
            )

        # Validar que todos los estados finales existan.
        if not set(self.estados_finales).issubset(set(self.estados)):
            raise ValueError(
                "Todos los estados finales deben pertenecer a la lista de estados."
            )

        # Validar que los simbolos del alfabeto no se repitan.
        if len(self.alfabeto) != len(set(self.alfabeto)):
            raise ValueError(
                "El alfabeto no puede contener simbolos repetidos."
            )

        # Validar los simbolos del alfabeto.
        for simbolo in self.alfabeto:
            if len(simbolo) != 1:
                raise ValueError(
                    "Cada simbolo del alfabeto debe tener un solo caracter."
                )

            if simbolo == EPSILON:
                raise ValueError(
                    "epsilon no puede formar parte del alfabeto."
                )

        # Validar las transiciones.
        claves_transiciones = set()

        for transicion in self.transiciones:
            if transicion.origen not in self.estados:
                raise ValueError(
                    f"El estado origen '{transicion.origen}' no existe."
                )

            if (
                transicion.simbolo != EPSILON
                and transicion.simbolo not in self.alfabeto
            ):
                raise ValueError(
                    f"El simbolo '{transicion.simbolo}' "
                    "no pertenece al alfabeto."
                )

            if len(transicion.destinos) != len(set(transicion.destinos)):
                raise ValueError(
                    "Una transicion contiene destinos repetidos."
                )

            if not set(transicion.destinos).issubset(set(self.estados)):
                raise ValueError(
                    "Una transicion contiene estados destino que no existen."
                )

            clave = (transicion.origen, transicion.simbolo)

            if clave in claves_transiciones:
                raise ValueError(
                    "Cada par (origen, simbolo) debe aparecer una sola vez. "
                    "Agrupa sus destinos en la misma transicion."
                )

            claves_transiciones.add(clave)

        # Validar los simbolos de la cadena.
        for simbolo in self.cadena:
            if simbolo not in self.alfabeto:
                raise ValueError(
                    f"El simbolo '{simbolo}' de la cadena "
                    "no pertenece al alfabeto."
                )

        return self