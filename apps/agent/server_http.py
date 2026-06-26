import asyncio, os, time
from collections import OrderedDict
from contextlib import asynccontextmanager

import jwt
from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel

from .agent import AgentRuntime, Conversation

JWT_SECRET = os.getenv("JWT_ACCESS_SECRET", "dev-access-secret-change-me")
ACCESS_COOKIE = "wetalk_session"

SESSION_TTL = float(os.getenv("AGENT_SESSION_TTL", 30 * 60))
MAX_SESSIONS = int(os.getenv("AGENT_MAX_SESSIONS", 1000))

_runtime = AgentRuntime()

_sessions: "OrderedDict[str, Conversation]" = OrderedDict()
_sessions_lock = asyncio.Lock()  # protège la map _sessions (pas les tours LLM)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _runtime.connect()
    try:
        yield
    finally:
        await _runtime.close()


app = FastAPI(title="WeTalk Agent", lifespan=lifespan)


class ChatRequest(BaseModel):
    message: str


def _extract_token(request: Request) -> str | None:
    """Cookie httpOnly (front) en priorité, sinon header Bearer (tests / est-ouest)."""
    token = request.cookies.get(ACCESS_COOKIE)
    if token:
        return token
    auth = request.headers.get("authorization", "")
    return auth[len("Bearer "):] if auth.startswith("Bearer ") else None


def _sweep(now: float) -> None:
    """Évince les sessions expirées (TTL) puis plafonne le nombre total (LRU).
    Appelé sous _sessions_lock."""
    stale = [k for k, c in _sessions.items() if now - c.last_used > SESSION_TTL]
    for k in stale:
        del _sessions[k]
    while len(_sessions) > MAX_SESSIONS:
        _sessions.popitem(last=False)  # plus ancien d'abord


async def _get_conversation(sub: str) -> Conversation:
    now = time.monotonic()
    async with _sessions_lock:
        _sweep(now)
        convo = _sessions.get(sub)
        if convo is None:
            convo = Conversation()
            _sessions[sub] = convo
        else:
            _sessions.move_to_end(sub)  # marque comme récemment utilisée
        convo.last_used = now
        return convo


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/chat")
async def chat(req: ChatRequest, request: Request):
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    convo = await _get_conversation(sub)
    # Lock PAR utilisateur : deux requêtes du même user sont sérialisées, mais des
    # utilisateurs différents s'exécutent en parallèle.
    async with convo.lock:
        answer = await _runtime.run_turn(convo, req.message, token)
        convo.last_used = time.monotonic()
    return {"answer": answer}
