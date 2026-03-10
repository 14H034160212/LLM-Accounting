import sys
import json
import chromadb
from pathlib import Path

# Paths
BASE_DIR = Path("/data/qbao775/llm-accounting")
CHROMA_PATH = BASE_DIR / "data" / "chroma_db"

def query_vector(query_text, n_results=5):
    client = chromadb.PersistentClient(path=str(CHROMA_PATH))
    collection = client.get_collection("market_reports")
    
    # We need to use the same embedding function as when we indexed
    # But for a simple query call from Node, it's better if we just pass the query
    # and let Chroma handle it if we configured a default, OR we manually call Ollama.
    # To keep it simple and robust, we'll manually get the embedding via Ollama here.
    
    import requests
    response = requests.post(
        "http://localhost:11434/api/embeddings",
        json={"model": "nomic-embed-text", "prompt": query_text}
    )
    embedding = response.json()["embedding"]
    
    results = collection.query(
        query_embeddings=[embedding],
        n_results=n_results
    )
    
    context_list = []
    for i in range(len(results['documents'][0])):
        context_list.append({
            "content": results['documents'][0][i],
            "metadata": results['metadatas'][0][i]
        })
        
    return context_list

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No query provided"}))
        sys.exit(1)
        
    query = sys.argv[1]
    try:
        results = query_vector(query)
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
