from backend.modelos.automata import Automata


EPSILON = "ε"


class AFNDE(Automata):
    def __init__(
        self,
        estados,
        alfabeto,
        transiciones,
        estado_inicial,
        estados_finales
    ):
        super().__init__(
            estados,
            alfabeto,
            transiciones,
            estado_inicial,
            estados_finales
        )

        self._validar()

    def _validar(self):
        if not self.estados:
            raise ValueError(
                "El AFND-ε debe tener al menos un estado."
            )

        if not self.alfabeto:
            raise ValueError(
                "El alfabeto no puede estar vacío."
            )

        if EPSILON in self.alfabeto:
            raise ValueError(
                "ε no puede formar parte del alfabeto."
            )

        if self.estado_inicial not in self.estados:
            raise ValueError(
                "El estado inicial debe pertenecer al conjunto de estados."
            )

        if not self.estados_finales.issubset(self.estados):
            raise ValueError(
                "Todos los estados finales deben pertenecer al conjunto de estados."
            )

        for (estado_origen, simbolo), estados_destino in self.transiciones.items():

            if estado_origen not in self.estados:
                raise ValueError(
                    f"El estado origen '{estado_origen}' no existe."
                )

            if simbolo != EPSILON and simbolo not in self.alfabeto:
                raise ValueError(
                    f"El símbolo '{simbolo}' no pertenece al alfabeto."
                )

            if not estados_destino.issubset(self.estados):
                raise ValueError(
                    "Una transición contiene un estado destino que no existe."
                )