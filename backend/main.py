from fastapi import FastAPI

from backend.routers.automatas import router as automatas_router


app = FastAPI(
    title="AutomatonLab",
    description="API para convertir y simular automatas finitos.",
    version="0.1.0",
)

app.include_router(automatas_router)