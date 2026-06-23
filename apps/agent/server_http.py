import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel
from .agent import ConversationAgent

_agent = ConversationAgent()
_lock = asyncio.Lock()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _agent.connect()
    try:
        yield
    finally:
        await _agent.close()


app = FastAPI(title="WeTalk Agent", lifespan=lifespan)


class ChatRequest(BaseModel):
    message: str


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/chat")
async def chat(req: ChatRequest):
    async with _lock:
        answer = await _agent.ask(req.message)
    return {"answer": answer}
