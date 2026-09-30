class Automata:
    def __init__(
        self,
        estados,
        alfabeto,
        transiciones,
        estado_inicial,
        estados_finales
    ):
        self.estados = estados
        self.alfabeto = alfabeto
        self.transiciones = transiciones
        self.estado_inicial = estado_inicial
        self.estados_finales = estados_finales