import httpx
from mcp.server.fastmcp import FastMCP
import dotenv

mcp = FastMCP("WeTalk MCP")

API_BASE = "http://localhost:3006" # TODO utiliser le .env

@mcp.tool()
def get_mcp_health() -> dict:
    mock = {
        "status" : "ok"
    }
    return mock

if __name__ == "__main__":
    mcp.run(transport="stdio")