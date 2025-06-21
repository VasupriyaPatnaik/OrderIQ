from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import FileResponse
import pytesseract
from PIL import Image
import pandas as pd
import io
import os
import time
import google.generativeai as genai
from dotenv import load_dotenv
import ast  # ✅ safer alternative to eval

# Load .env variables
load_dotenv()

# API Key Setup
GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found in environment.")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-pro-vision")

app = FastAPI()

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class TextData(BaseModel):
    input_text: str

# Helper to generate unique Excel filenames
def save_to_excel(data: list, folder="outputs"):
    os.makedirs(folder, exist_ok=True)
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    filename = f"{folder}/structured_output_{timestamp}.xlsx"
    df = pd.DataFrame(data)
    df.to_excel(filename, index=False)
    return filename

# Store latest generated file path
latest_file_path = ""

@app.post("/extract_from_text")
def extract_from_text(data: TextData):
    global latest_file_path
    prompt = f"""
    You are an intelligent assistant. Extract structured information from the message below.

    Extract the following fields:
    - product name
    - quantity
    - shipping address

    Output as a JSON array in this format:
    [
        {{"product": "Amul Butter", "quantity": "10", "address": "Hyderabad"}},
        ...
    ]

    Message:
    {data.input_text}
    """
    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        result = ast.literal_eval(result_text)  # ✅ Safe eval

        latest_file_path = save_to_excel(result)
        return {"message": "Text extraction successful", "data": result, "file": latest_file_path}
    except Exception as e:
        return {"error": "Text extraction failed", "details": str(e)} 

@app.post("/extract_from_image")
async def extract_from_image(file: UploadFile = File(...)):
    global latest_file_path
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))

        prompt = """
        Analyze this image containing a product order message.
        Extract product names, quantities, and shipping address.

        Format output as:
        [
            { "product": "Parle-G", "quantity": "20", "address": "Chennai" },
            ...
        ]
        """

        response = model.generate_content([prompt, image])
        result_text = response.text.strip()
        result = ast.literal_eval(result_text)

        latest_file_path = save_to_excel(result)
        return {"message": "Image extraction successful", "data": result, "file": latest_file_path}
    except Exception as e:
        return {"error": "Image extraction failed", "details": str(e)}

@app.get("/download_excel")
def download_excel():
    if latest_file_path and os.path.exists(latest_file_path):
        return FileResponse(
            latest_file_path,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename=os.path.basename(latest_file_path)
        )
    return {"error": "No Excel file available for download."}
