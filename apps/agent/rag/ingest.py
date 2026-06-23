import os, chromadb
from pathlib import Path
from sentence_transformers import SentenceTransformer

def load_docs(docs_dir: str) -> list[dict]:
    chunks = []
    base_path = Path(__file__).resolve().parent / docs_dir
    for path in base_path.glob('*.txt'):
        text = path.read_text(encoding='utf-8')
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        for i, para in enumerate(paragraphs):
            chunks.append({'id': f'{path.stem}_{i}', 'text': para, 'source': path.name})
    return chunks

def build_vector_store(docs_dir: str = 'docs'):
    # Detecter le mode local vs Docker
    host = os.getenv('CHROMA_HOST', 'localhost')
    port = int(os.getenv('CHROMA_PORT', '8000'))
    if host == 'localhost':
        client = chromadb.PersistentClient(path='.chromadb')
    else:
        client = chromadb.HttpClient(host=host, port=port)

    collection = client.get_or_create_collection('kg_b')
    model = SentenceTransformer('all-MiniLM-L6-v2')

    docs = load_docs(docs_dir)
    print(f'Ingestion de {len(docs)} chunks...')

    for doc in docs:
        embedding = model.encode(doc['text']).tolist()
        collection.add(
            ids=[doc['id']],
            embeddings=[embedding],
            documents=[doc['text']],
            metadatas=[{'source': doc['source']}]
        )
    
    print(f'Base vectorielle construite avec {collection.count()} documents.')
    return collection

if __name__ == '__main__':
    build_vector_store(docs_dir='docs')