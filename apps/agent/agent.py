import asyncio, os, argparse
import ollama
from pathlib import Path
from contextlib import AsyncExitStack
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from .rag.retriever import retrieve_context

# MODEL = "fervent_mcclintock/Qwen2.5-Coder-0.5B-Instruct:Q4_K_M"
MODEL = "qwen3:4b"
SERVER_SCRIPT = Path(__file__).resolve().parent / "mcp-server" / "server.py"
MCP_SERVER = StdioServerParameters(
    command="python",
    args=[str(SERVER_SCRIPT)],
)

PROMPT_PATH = Path(__file__).parent / "prompts" / "system.md"
SYSTEM_PROMPT = PROMPT_PATH.read_text(encoding="utf-8")

MAX_HISTORY = 10

ollama_client = ollama.Client(host=os.getenv("OLLAMA_HOST", "http://localhost:11434"))

def mcp_tools_to_ollama(mcp_tools) -> list:
    return [
        {
            "type": "function",
            "function": {
                "name": t.name,
                "description": t.description,
                "parameters": t.inputSchema,
            }
        }
        for t in mcp_tools
    ]


class ConversationAgent:
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.history = [{"role": "system", "content": SYSTEM_PROMPT}]
        self.session: ClientSession | None = None
        self.tools: list = []
        self._stack: AsyncExitStack | None = None

    def _log(self, msg: str):
        if self.verbose:
            print(msg)

    def _trim_history(self):
        """Garde le system prompt + les MAX_HISTORY derniers messages."""
        system, rest = self.history[0], self.history[1:]
        rest = rest[-MAX_HISTORY:]
        # un message 'tool' doit suivre un 'assistant' tool_calls : pas en tête
        while rest and rest[0]["role"] == "tool":
            rest.pop(0)
        self.history = [system] + rest

    async def connect(self):
        """Lance le serveur MCP une seule fois et garde la session ouverte."""
        self._stack = AsyncExitStack()
        read, write = await self._stack.enter_async_context(stdio_client(MCP_SERVER))
        self.session = await self._stack.enter_async_context(ClientSession(read, write))
        await self.session.initialize()

        tools_response = await self.session.list_tools()
        self.tools = mcp_tools_to_ollama(tools_response.tools)
        print(f'[MCP] {len(self.tools)} outils disponibles : {[t["function"]["name"] for t in self.tools]}')

    async def close(self):
        if self._stack:
            await self._stack.aclose()
            self._stack = None

    async def ask(self, user_query: str) -> str:
        """Boucle ReAct : raisonnement -> action (outil) -> observation."""
        context = retrieve_context(user_query)
        self._log(f"[ReAct] Contexte RAG récupéré ({len(context)} caractères)")
        self.history.append({
            "role": "user",
            "content": f"Contexte :\n{context}\n\nQuestion : {user_query}",
        })

        for step in range(5):
            self._log(f"[ReAct] Étape {step + 1} — Réflexion (LLM)…")
            response = ollama_client.chat(model=MODEL, messages=self.history, tools=self.tools)
            msg = response.message

            if not msg.tool_calls:
                self._log("[ReAct] Pas d'appel outil → réponse finale")
                self.history.append({"role": "assistant", "content": msg.content})
                self._trim_history()
                return msg.content

            self.history.append({
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
                self._log(f"[ReAct] Action : {tc.function.name}({args})")
                tool_result = await self.session.call_tool(tc.function.name, arguments=args)
                content = tool_result.content[0].text if tool_result.content else "{}"
                self._log(f"[ReAct] Observation : {content}")
                self.history.append({"role": "tool", "content": content})

        self._trim_history()
        return "Désolé, je n'ai pas pu traiter votre requête."


async def main():
    parser = argparse.ArgumentParser(description="Agent IA WeTalk")
    parser.add_argument("-v", "--verbose", action="store_true", help="Affiche chaque étape de la boucle ReAct")
    args = parser.parse_args()

    agent = ConversationAgent(verbose=args.verbose)
    await agent.connect()
    try:
        print("Agent IA prêt. Tapez 'quit' pour quitter.\n")
        while True:
            query = input("Vous : ").strip()
            if query.lower() == "quit":
                break
            answer = await agent.ask(query)
            print(f"Agent : {answer}\n")
    finally:
        await agent.close()

if __name__ == "__main__":
    asyncio.run(main())
