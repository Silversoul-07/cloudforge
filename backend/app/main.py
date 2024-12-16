from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .images.routes import router as image_router
from .users.routes import router as user_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(user_router)
app.include_router(image_router)

@app.get("/")
def redirect_to_docs():
    return RedirectResponse(url="/docs")

@app.get("/health")
def get_health():
    print("healthy")
    return {"status": "ok"}

@app.get("/api/health")
def get_api_health():
    return {"status": "ok"}