from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers.automatas import router as automatas_router


app = FastAPI(
    title="AutomatonLab",
    description="API para convertir y simular automatas finitos.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ],
    allow_credentials=False,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

app.include_router(automatas_router)