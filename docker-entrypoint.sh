#!/bin/bash
# Start Ollama server in the background
ollama serve &
SERVER_PID=$!

# Wait for Ollama to be available
echo "Waiting for Ollama to start..."
until ollama list >/dev/null 2>&1; do
  sleep 2
done
echo "Ollama is ready."

# Pull the required models
echo "Pulling models..."
# Primary chat model
ollama pull qwen3:8b || ollama pull llama3:8b

# Vision model (Qwen-VL style)
# Correct name found in registry is qwen3-vl:8b
ollama pull qwen3-vl:8b || ollama pull qwen2.5-vl || ollama pull llava:7b
echo "Ollama setup complete! Keeping server running..."
wait $SERVER_PID
