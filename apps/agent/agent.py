import asyncio, json, os, time, argparse
from pathlib import Path
from contextlib import AsyncExitStack

import httpx
import ollama
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from .rag.retriever import retrieve_context

MODEL = os.getenv("AGENT_MODEL", "qwen3:4b")
SERVER_SCRIPT = Path(__file__).resolve().parent / "mcp-server" / "server.py"
MCP_SERVER = StdioServerParameters(
    command="python",
    args=[str(SERVER_SCRIPT)],
)

PROMPT_PATH = Path(__file__).parent / "prompts" / "system.md"
SYSTEM_PROMPT = PROMPT_PATH.read_text(encoding="utf-8")

MAX_HISTORY = 10
MAX_STEPS = 5

OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "120"))
MCP_TOOL_TIMEOUT = float(os.getenv("MCP_TOOL_TIMEOUT", "20"))

NUM_CTX = int(os.getenv("OLLAMA_NUM_CTX", "4096"))
_THINK_ENV = os.getenv("OLLAMA_THINK")  # None | "0" | "1"

ollama_client = ollama.Client(
    host=os.getenv("OLLAMA_HOST", "http://localhost:11434"),
    timeout=OLLAMA_TIMEOUT,
)


def _chat(messages: list, tools: list):
    """Appel Ollama avec contexte borné. `think` n'est transmis que si
    OLLAMA_THINK est défini, pour rester compatible avec les modèles sans
    raisonnement (qwen2.5)."""
    kwargs = {}
    if _THINK_ENV is not None:
        kwargs["think"] = _THINK_ENV == "1"
    return ollama_client.chat(
        model=MODEL,
        messages=messages,
        tools=tools,
        options={"num_ctx": NUM_CTX},
        **kwargs,
    )


INJECT_PREFIX = "ctx_"

def mcp_tools_to_ollama(mcp_tools) -> list:
    """Convertit les outils MCP au format Ollama. Les paramètres préfixés par
    `ctx_` (ex. `ctx_token`) sont injectés côté serveur et masqués au LLM."""
    out = []
    for t in mcp_tools:
        schema = dict(t.inputSchema or {})
        props = schema.get("properties")
        if props:
            schema["properties"] = {k: v for k, v in props.items() if not k.startswith(INJECT_PREFIX)}
            if "required" in schema:
                schema["required"] = [r for r in schema["required"] if not r.startswith(INJECT_PREFIX)]
        out.append({
            "type": "function",
            "function": {
                "name": t.name,
                "description": t.description,
                "parameters": schema,
            },
        })
    return out


class Conversation:
    """État propre à UN utilisateur : seulement son historique. Volontairement léger
    pour pouvoir en garder beaucoup en mémoire simultanément."""

    def __init__(self):
        self.history = [{"role": "system", "content": SYSTEM_PROMPT}]
        self.last_used = time.monotonic()
        # Sérialise les requêtes concurrentes d'un même utilisateur (intégrité de
        # l'historique). Deux utilisateurs différents ont chacun leur lock → parallèles.
        self.lock = asyncio.Lock()

    def trim(self):
        """Garde le system prompt + les MAX_HISTORY derniers messages."""
        system, rest = self.history[0], self.history[1:][-MAX_HISTORY:]
        # un message 'tool' doit suivre un 'assistant' tool_calls : jamais en tête
        while rest and rest[0]["role"] == "tool":
            rest.pop(0)
        self.history = [system] + rest


class AgentRuntime:
    """Ressources PARTAGÉES par tous les utilisateurs : connexion au serveur MCP,
    catalogue d'outils, client LLM. Une seule instance pour tout le service. Ne
    contient aucun état conversationnel — celui-ci vit dans les `Conversation`."""

    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.session: ClientSession | None = None
        self.tools: list = []
        # nom d'outil -> paramètres injectés côté serveur (préfixés '_')
        self._injectable: dict[str, list[str]] = {}
        self._stack: AsyncExitStack | None = None

    def _log(self, msg: str):
        if self.verbose:
            print(msg)

    async def connect(self):
        """Lance le serveur MCP une seule fois et garde la session ouverte."""
        self._stack = AsyncExitStack()
        read, write = await self._stack.enter_async_context(stdio_client(MCP_SERVER))
        self.session = await self._stack.enter_async_context(ClientSession(read, write))
        await self.session.initialize()

        resp = await self.session.list_tools()
        self.tools = mcp_tools_to_ollama(resp.tools)
        self._injectable = {
            t.name: [k for k in (t.inputSchema or {}).get("properties", {}) if k.startswith(INJECT_PREFIX)]
            for t in resp.tools
        }
        print(f'[MCP] {len(self.tools)} outils disponibles : {[t["function"]["name"] for t in self.tools]}')

    async def close(self):
        if self._stack:
            await self._stack.aclose()
            self._stack = None

    async def run_turn(self, convo: Conversation, user_query: str, token: str | None = None) -> str:
        """Un tour ReAct (raisonnement -> action -> observation) sur l'historique
        d'UNE conversation. L'appelant doit détenir `convo.lock`.

        `token` est le JWT de l'utilisateur, injecté dans les paramètres `ctx_token`
        des outils qui en déclarent — jamais exposé au LLM."""
        # encode() et ollama.chat() sont bloquants : on les sort de l'event loop
        # pour ne pas figer les autres utilisateurs.
        context = await asyncio.to_thread(retrieve_context, user_query)
        self._log(f"[ReAct] Contexte RAG récupéré ({len(context)} caractères)")
        convo.history.append({
            "role": "user",
            "content": f"Contexte :\n{context}\n\nQuestion : {user_query}",
        })

        inject_ctx = {"ctx_token": token}

        for step in range(MAX_STEPS):
            self._log(f"[ReAct] Étape {step + 1} — Réflexion (LLM)…")
            try:
                # httpx coupe au bout de OLLAMA_TIMEOUT ; wait_for est un filet de
                # sécurité si le thread ne rend pas la main (libère le lock quoi qu'il arrive).
                response = await asyncio.wait_for(
                    asyncio.to_thread(
                        _chat, convo.history, self.tools
                    ),
                    timeout=OLLAMA_TIMEOUT + 5,
                )
            except (asyncio.TimeoutError, httpx.HTTPError, ollama.ResponseError) as e:
                self._log(f"[ReAct] Erreur/timeout LLM : {e}")
                convo.trim()
                return "Désolé, le service IA met trop de temps à répondre. Réessaie dans un instant."
            msg = response.message

            if not msg.tool_calls:
                self._log("[ReAct] Pas d'appel outil → réponse finale")
                convo.history.append({"role": "assistant", "content": msg.content})
                convo.trim()
                return msg.content

            convo.history.append({
                "role": "assistant",
                "content": msg.content or "",
                "tool_calls": [
                    {"function": {"name": tc.function.name,
                                  "arguments": dict(tc.function.arguments)}}
                    for tc in msg.tool_calls
                ],
            })
            for tc in msg.tool_calls:
                args = dict(tc.function.arguments)
                for p in self._injectable.get(tc.function.name, []):
                    if p in inject_ctx:
                        args[p] = inject_ctx[p]
                self._log(f"[ReAct] Action : {tc.function.name}({tc.function.arguments})")
                # Un outil qui hang ne doit pas figer le tour : timeout + erreur
                # réinjectée comme observation pour que le LLM puisse rebondir.
                try:
                    tool_result = await asyncio.wait_for(
                        self.session.call_tool(tc.function.name, arguments=args),
                        timeout=MCP_TOOL_TIMEOUT,
                    )
                    content = tool_result.content[0].text if tool_result.content else "{}"
                except asyncio.TimeoutError:
                    content = json.dumps({"error": "outil: délai dépassé"})
                except Exception as e:
                    content = json.dumps({"error": f"outil indisponible: {e}"})
                self._log(f"[ReAct] Observation : {content}")
                convo.history.append({"role": "tool", "content": content})

        convo.trim()
        return "Désolé, je n'ai pas pu traiter votre requête."


async def main():
    parser = argparse.ArgumentParser(description="Agent IA WeTalk (REPL)")
    parser.add_argument("-v", "--verbose", action="store_true", help="Affiche chaque étape de la boucle ReAct")
    args = parser.parse_args()

    runtime = AgentRuntime(verbose=args.verbose)
    await runtime.connect()
    convo = Conversation()  # une seule conversation en mode REPL
    try:
        print("Agent IA prêt. Tapez 'quit' pour quitter.\n")
        while True:
            query = input("Vous : ").strip()
            if query.lower() == "quit":
                break
            async with convo.lock:
                answer = await runtime.run_turn(convo, query, token=None)
            print(f"Agent : {answer}\n")
    finally:
        await runtime.close()


if __name__ == "__main__":
    asyncio.run(main())
