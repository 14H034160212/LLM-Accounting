import os
import pdfplumber
import chromadb
from chromadb.utils import embedding_functions
import requests
from pathlib import Path

# Paths
BASE_DIR = Path("/data/qbao775/llm-accounting")
REPORTS_DIR = BASE_DIR / "data/reports"
DB_DIR = BASE_DIR / "data/chroma_db"

# Ensure DB directory exists
DB_DIR.mkdir(parents=True, exist_ok=True)

# Custom Ollama Embedding Function
class OllamaEmbeddingFunction(embedding_functions.EmbeddingFunction):
    def __init__(self, model_name="nomic-embed-text", base_url="http://localhost:11434"):
        self.model_name = model_name
        self.base_url = base_url

    def __call__(self, texts):
        embeddings = []
        for text in texts:
            response = requests.post(
                f"{self.base_url}/api/embeddings",
                json={"model": self.model_name, "prompt": text}
            )
            if response.status_code == 200:
                embeddings.append(response.json()["embedding"])
            else:
                raise Exception(f"Failed to get embedding from Ollama: {response.text}")
        return embeddings

def extract_text_from_pdf(pdf_path):
    """
    Extract text from a PDF file.
    """
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
    return text

def chunk_text(text, chunk_size=1000, chunk_overlap=200):
    """
    Split text into chunks.
    """
    chunks = []
    for i in range(0, len(text), chunk_size - chunk_overlap):
        chunks.append(text[i:i + chunk_size])
    return chunks

def process_reports():
    client = chromadb.PersistentClient(path=str(DB_DIR))
    
    # Use Ollama for embeddings
    embedding_func = OllamaEmbeddingFunction()
    
    collection = client.get_or_create_collection(
        name="market_reports",
        embedding_function=embedding_func
    )
    
    pdf_files = list(REPORTS_DIR.glob("*.pdf"))
    print(f"Found {len(pdf_files)} PDF files in {REPORTS_DIR}")
    
    for pdf_file in pdf_files:
        try:
            # Filename format: {prefix}_{ticker}_{doc_key}.pdf
            parts = pdf_file.stem.split('_')
            ticker = parts[1] if len(parts) > 1 else "Unknown"
            report_id = pdf_file.stem
            
            # Check if already processed
            existing = collection.get(ids=[f"{report_id}_chunk_0"])
            if existing and existing['ids']:
                print(f"Already processed: {pdf_file.name}")
                continue
                
            print(f"Processing {pdf_file.name} for {ticker}...")
            text = extract_text_from_pdf(pdf_file)
            if not text:
                print(f"Warning: No text extracted from {pdf_file.name}")
                continue
                
            chunks = chunk_text(text)
            print(f"Created {len(chunks)} chunks for {pdf_file.name}")
            
            # Process in sub-batches for Chroma adding (prevent giant transactions)
            batch_size = 50
            for i in range(0, len(chunks), batch_size):
                batch_chunks = chunks[i:i + batch_size]
                batch_ids = [f"{report_id}_chunk_{j}" for j in range(i, i + len(batch_chunks))]
                batch_metadatas = [{"ticker": ticker, "source": pdf_file.name} for _ in range(len(batch_chunks))]
                
                collection.add(
                    documents=batch_chunks,
                    metadatas=batch_metadatas,
                    ids=batch_ids
                )
            print(f"Successfully indexed {len(chunks)} chunks for {ticker}")
        except Exception as e:
            print(f"Critical error processing {pdf_file.name}: {e}")

if __name__ == "__main__":
    process_reports()
