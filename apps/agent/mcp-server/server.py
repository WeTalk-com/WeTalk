"""Serveur MCP WeTalk.

Expose des outils que l'agent IA peut appeler pour interroger / agir sur la
plateforme, via la passerelle Nginx. Chaque outil reçoit le JWT de l'utilisateur
dans le paramètre `ctx_token`, injecté par le code de l'agent (jamais par le LLM) et
masqué du schéma vu par le modèle (cf. `mcp_tools_to_ollama` côté agent).
"""

import os
import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("WeTalk MCP")

API_BASE = os.getenv("API_BASE", "http://gateway")
TIMEOUT = float(os.getenv("MCP_HTTP_TIMEOUT", "10"))
POST_MAX_LEN = 280  # aligné sur le schéma post-service


def _client(token: str | None) -> httpx.Client:
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    return httpx.Client(
        base_url=API_BASE, headers=headers, timeout=TIMEOUT, follow_redirects=True
    )


def _err(resp: httpx.Response) -> dict:
    """Erreur HTTP normalisée et lisible pour le LLM."""
    if resp.status_code == 401:
        return {"error": "Utilisateur non authentifié (session expirée)."}
    if resp.status_code == 403:
        return {"error": "Action non autorisée (compte banni ou suspendu)."}
    try:
        detail = resp.json().get("error")
    except Exception:
        detail = None
    return {"error": detail or f"Le service a répondu {resp.status_code}."}


def _short(text: str | None, n: int = 140) -> str:
    if not text:
        return ""
    text = text.strip()
    return text if len(text) <= n else text[: n - 1] + "…"


def _author_name(author: dict | None) -> str:
    if not author:
        return "Inconnu"
    return author.get("displayName") or author.get("username") or "Inconnu"


@mcp.tool()
def create_post(text: str, ctx_token: str = "") -> dict:
    """Publie un nouveau message (post) sur WeTalk au nom de l'utilisateur.

    Le texte doit faire entre 1 et 280 caractères. Les #tags et @mentions qu'il
    contient sont traités automatiquement par la plateforme. Utilise cet outil
    uniquement quand l'utilisateur demande explicitement de publier.
    """
    text = (text or "").strip()
    if not text:
        return {"error": "Le message est vide."}
    if len(text) > POST_MAX_LEN:
        return {
            "error": f"Message trop long ({len(text)} caractères, maximum {POST_MAX_LEN}).",
            "hint": "Raccourcis le texte puis réessaie.",
        }
    try:
        with _client(ctx_token) as c:
            r = c.post("/api/posts", json={"content": text})
    except httpx.HTTPError as e:
        return {"error": f"Service de publication injoignable : {e}"}
    if r.status_code != 201:
        return _err(r)
    post = r.json().get("post", {})
    return {
        "ok": True,
        "post_id": post.get("_id") or post.get("id"),
        "content": post.get("content"),
        "tags": post.get("tags", []),
    }


@mcp.tool()
def get_my_briefing(ctx_token: str = "") -> dict:
    """Résume ce que l'utilisateur a manqué : nombre de notifications non lues,
    dernières notifications, et derniers posts de son fil d'actualité.

    À utiliser quand l'utilisateur demande « quoi de neuf », « qu'est-ce que j'ai
    raté », un résumé de son activité ou de ses notifications.
    """
    out: dict = {}
    with _client(ctx_token) as c:
        # 1) Compteur de non-lues
        try:
            r = c.get("/api/notifications/unread")
            out["unread_count"] = r.json().get("count", 0) if r.status_code == 200 else None
            if r.status_code == 401:
                return _err(r)
        except httpx.HTTPError:
            out["unread_count"] = None

        # 2) Dernières notifications
        try:
            r = c.get("/api/notifications", params={"limit": 5})
            notifs = r.json().get("notifications", []) if r.status_code == 200 else []
        except httpx.HTTPError:
            notifs = []
        out["recent_notifications"] = [
            {
                "type": n.get("type"),
                "from": _author_name(n.get("actor")),
                "preview": _short(n.get("preview"), 80),
                "read": n.get("read", False),
            }
            for n in notifs
        ]

        # 3) Derniers posts du fil
        try:
            r = c.get("/api/posts/feed", params={"limit": 5})
            posts = r.json().get("posts", []) if r.status_code == 200 else []
        except httpx.HTTPError:
            posts = []
        out["recent_feed"] = [
            {
                "author": _author_name(p.get("author")),
                "content": _short(p.get("content")),
                "likes": p.get("likeCount", 0),
                "comments": p.get("commentCount", 0),
            }
            for p in posts
            if not p.get("authorBanned")
        ]

    return out


@mcp.tool()
def search_users(query: str, ctx_token: str = "") -> dict:
    """Recherche des utilisateurs WeTalk par nom d'affichage ou pseudo (@handle).

    À utiliser quand l'utilisateur veut trouver ou identifier un compte
    (« trouve Marc », « est-ce que @x existe »).
    """
    query = (query or "").strip()
    if not query:
        return {"error": "Terme de recherche vide."}
    try:
        with _client(ctx_token) as c:
            r = c.get("/api/users", params={"search": query})
    except httpx.HTTPError as e:
        return {"error": f"Service utilisateurs injoignable : {e}"}
    if r.status_code != 200:
        return _err(r)
    users = r.json()
    results = [
        {
            "username": u.get("username"),
            "displayName": u.get("displayName"),
            "description": _short(u.get("description"), 100),
            "banned": u.get("isBanned", False),
        }
        for u in (users if isinstance(users, list) else [])
    ]
    return {"count": len(results), "users": results[:10]}


if __name__ == "__main__":
    mcp.run(transport="stdio")
