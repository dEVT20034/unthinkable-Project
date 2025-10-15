# Unthinkable - Ask Your Files

A powerful document Q&A application using RAG (Retrieval-Augmented Generation) with Google's Gemini AI.

## Features

- 📄 **Multi-format Support**: Upload PDF, DOCX, and TXT files
- 🔍 **Smart Document Search**: Uses embedding-based retrieval for accurate answers
- 🤖 **AI-Powered Responses**: Leverages Google Gemini models for natural language answers
- 💾 **In-Memory Knowledge Base**: Fast document processing and querying
- 🎨 **Modern UI**: Clean, responsive interface with dark/light theme toggle
- 📊 **Document Analytics**: View chunks, sources, and relevance scores

## Setup

### Prerequisites

- Python 3.8+
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dEVT20034/unthinkable-ask-your-files.git
cd unthinkable-ask-your-files
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Create a .env file or set environment variable
GEMINI_API_KEY=your_gemini_api_key_here
```

### Running the Application

#### Development
```bash
python app.py
```

#### Production (using Gunicorn)
```bash
gunicorn app:app
```

The application will be available at `http://localhost:5501` (or the port specified in the `PORT` environment variable).

## Usage

1. **Upload Documents**: Drag and drop or select PDF, DOCX, or TXT files
2. **Index Content**: Click "Upload & Index" to process documents into searchable chunks
3. **Ask Questions**: Type your questions in natural language
4. **Get Answers**: Receive AI-generated responses with source citations

## Configuration

### Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `PORT`: Server port (default: 5501)
- `FLASK_DEBUG`: Debug mode (0 or 1)

### File Limits

- Maximum files per upload: 10
- Maximum file size: 20 MB
- Supported formats: PDF, DOCX, TXT

## API Endpoints

- `GET /`: Serve the main application
- `POST /upload`: Upload and index documents
- `POST /ask`: Ask questions about uploaded documents
- `GET /suggest`: Get suggested questions
- `POST /reset`: Clear knowledge base and uploads
- `GET /health`: Health check
- `GET /models`: List available Gemini models

## Project Structure

```
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── Procfile           # Deployment configuration
├── public/            # Frontend assets
│   ├── index.html     # Main HTML page
│   ├── client.js      # Frontend JavaScript
│   └── styles.css     # Stylesheet
├── uploads/           # Uploaded files (gitignored)
└── .gitignore         # Git ignore rules
```

## Deployment

This application is configured for deployment on platforms like Render, Heroku, or similar PaaS providers.

### Deploy to Render

1. Connect your GitHub repository to Render
2. Set the `GEMINI_API_KEY` environment variable
3. Deploy using the included `Procfile`

## Technologies Used

- **Backend**: Flask, Python
- **AI/ML**: Google Gemini API
- **Document Processing**: pdfminer.six, python-docx
- **Frontend**: Vanilla JavaScript, CSS3
- **Deployment**: Gunicorn

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub or contact the development team.