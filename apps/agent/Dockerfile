FROM python:3.12-slim
WORKDIR /app

# Deps Python
COPY requirements.txt ./agent-requirements.txt
COPY mcp-server/requirements.txt ./mcp-requirements.txt
RUN pip install --no-cache-dir -r agent-requirements.txt -r mcp-requirements.txt

# Pré-télécharge le modèle d'embeddings
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY . ./agent/
RUN sed -i 's/\r$//' ./agent/init-chromadb.sh && chmod +x ./agent/init-chromadb.sh

ENTRYPOINT ["/app/agent/init-chromadb.sh"]
CMD ["uvicorn", "agent.server_http:app", "--host", "0.0.0.0", "--port", "8000"]
