# Unthinkable — Ask Your Files (Gemini RAG)

A lightweight Retrieval-Augmented Generation (RAG) app built with **Flask + Gemini**.
Upload **PDF/DOCX/TXT**, ask questions, and get answers grounded in your documents.

## Features
- Upload & index multiple files (PDF/DOCX/TXT)
- Chunking + **text-embedding-004** for retrieval
- Gemini generation with context-only prompt
- Clean UI (drag & drop, “Select files”, example prompts, citations)
- **Reset** wipes chunks **and** deletes uploaded files

## Tech
- Backend: Flask, pdfminer.six, python-docx, requests
- Frontend: Vanilla HTML/CSS/JS
- LLM: Google Gemini (dynamic model discovery)
- Embeddings: `text-embedding-004`

## Local setup
```bash
python -m venv venv
venv\Scripts\activate           # (Windows)  # or: source venv/bin/activate (macOS/Linux)
pip install -r requirements.txt
# IMPORTANT: set your API key in env before running:
# PowerShell:  setx GEMINI_API_KEY "YOUR_REAL_KEY"
# macOS/Linux: export GEMINI_API_KEY="YOUR_REAL_KEY"
python app.py
