import os, chromadb
from sentence_transformers import SentenceTransformer

CHROMA_HOST = os.getenv('CHROMA_HOST', 'localhost')
CHROMA_PORT = int(os.getenv('CHROMA_PORT', '8000'))

if CHROMA_HOST == 'localhost':
    _client = chromadb.PersistentClient(path='.chromadb')
else:
    _client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)

_model = SentenceTransformer('all-MiniLM-L6-v2')

def retrieve_context(query: str, n_results: int = 3) -> str:
    collection = _client.get_collection('kg_b')
    embedding = _model.encode(query).tolist()
    results = collection.query(
        query_embeddings=[embedding],
        n_results=n_results
    )
    return '\n---\n'.join(results['documents'][0])