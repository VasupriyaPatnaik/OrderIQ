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
import ast
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Gemini API Key
GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found in .env")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-1.5-pro")

# FastAPI App Initialization
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Schema
class TextData(BaseModel):
    input_text: str

# Track latest Excel file
latest_file_path = ""

# Excel writer helper
def save_to_excel(data: list, folder="outputs"):
    os.makedirs(folder, exist_ok=True)
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    filepath = f"{folder}/structured_output_{timestamp}.xlsx"
    pd.DataFrame(data).to_excel(filepath, index=False)
    return filepath

# Text API
@app.post("/extract_from_text")
def extract_from_text(data: TextData):
    global latest_file_path
    prompt = f"""
    You are a smart assistant. Extract structured info from the following message.

    Required fields:
    - product
    - quantity
    - shipping address

    Output format (JSON):
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
        print("🧠 Gemini raw response:", result_text)

        result = ast.literal_eval(result_text)
        print("✅ Parsed result:", result)

        latest_file_path = save_to_excel(result)
        return {
            "message": "Text extraction successful",
            "data": result,
            "download_url": "/download_excel"
        }
    except Exception as e:
        return {"error": "Text extraction failed", "details": str(e)}

# Image API
@app.post("/extract_from_image")
async def extract_from_image(file: UploadFile = File(...)):
    global latest_file_path
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))

        prompt = """
        Analyze the fax image and extract:
        - product name
        - quantity
        - shipping address

        Format:
        [
          { "product": "Parle-G", "quantity": "20", "address": "Chennai" },
          ...
        ]
        """

        response = model.generate_content([prompt, image])
        result_text = response.text.strip()
        print("🖼️ Gemini image response:", result_text)

        result = ast.literal_eval(result_text)
        print("✅ Parsed image result:", result)

        latest_file_path = save_to_excel(result)
        return {
            "message": "Image extraction successful",
            "data": result,
            "download_url": "/download_excel"
        }
    except Exception as e:
        return {"error": "Image extraction failed", "details": str(e)}

# Excel Download API
@app.get("/download_excel")
def download_excel():
    if latest_file_path and os.path.exists(latest_file_path):
        return FileResponse(
            latest_file_path,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename=os.path.basename(latest_file_path)
        )
    return {"error": "No Excel file available for download."}
