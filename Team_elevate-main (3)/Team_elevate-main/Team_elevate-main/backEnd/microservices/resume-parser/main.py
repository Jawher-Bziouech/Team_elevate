import re
import spacy
from fastapi import FastAPI, UploadFile, File
from py_eureka_client import eureka_client
import uvicorn
from pdfminer.high_level import extract_text
import docx
import io
import asyncio

# Load NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    # Fallback if model not downloaded yet
    nlp = None

app = FastAPI()

# Eureka Configuration
EUREKA_SERVER = "http://localhost:8761/eureka"
APP_NAME = "resume-parser"
INSTANCE_PORT = 8000

@app.on_event("startup")
async def startup_event():
    # Register with Eureka
    try:
        await eureka_client.init_async(
            eureka_server=EUREKA_SERVER,
            app_name=APP_NAME,
            instance_port=INSTANCE_PORT,
            instance_host="localhost" # Force localhost for reliable routing
        )
        print(f"Registered with Eureka at {EUREKA_SERVER}")
    except Exception as e:
        print(f"Failed to register with Eureka: {e}")

def extract_text_from_pdf(file_content):
    return extract_text(io.BytesIO(file_content))

def extract_text_from_docx(file_content):
    doc = docx.Document(io.BytesIO(file_content))
    return "\n".join([para.text for para in doc.paragraphs])

@app.post("/api/resume/parse")
async def parse_resume(file: UploadFile = File(...)):
    content = await file.read()
    text = ""
    
    try:
        if file.filename.endswith(".pdf"):
            text = extract_text_from_pdf(content)
        elif file.filename.endswith(".docx") or file.filename.endswith(".doc"):
            text = extract_text_from_docx(content)
    except Exception as e:
        return {"error": f"Failed to extract text: {str(e)}"}

    # Parsing Logic (Regex)
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{2,3}\)?[-.\s]?\d{3}[-.\s]?\d{3,4}', text)
    
    # Name extraction using spaCy if available
    full_name = None
    if nlp:
        doc = nlp(text[:1000]) # Scan more text for name
        for ent in doc.ents:
            if ent.label_ == "PERSON" and len(ent.text.split()) >= 2:
                # Basic heuristic: names are usually near the top and don't contain common words
                full_name = ent.text
                break
    
    # Fallback for name if NLP fails (very basic)
    if not full_name:
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        if lines:
            full_name = lines[0] # Assume first non-empty line is name

    return {
        "fullName": full_name or "Not found",
        "email": email_match.group(0) if email_match else "Not found",
        "phone": phone_match.group(0) if phone_match else "Not found"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=INSTANCE_PORT)
