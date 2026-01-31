from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import FileResponse
from PIL import Image
import pandas as pd
import os
import time
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv
from google.cloud import vision  # ✅ Added for OCR

# Load environment variables
load_dotenv()

# Configure Gemini API
GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found in .env")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Track latest Excel file
latest_file_path = ""

# Input model for multiple messages
class BatchTextData(BaseModel):
    input_texts: list[str]

# Helper to save to Excel
def save_to_excel(data: list, folder="outputs"):
    os.makedirs(folder, exist_ok=True)
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    filepath = f"{folder}/OrderIQ_Output_{timestamp}.xlsx"
    pd.DataFrame(data).to_excel(filepath, index=False)
    return filepath

# ✅ Helper for Google Vision OCR (for handwritten/typed text)
def extract_text_from_image_google_vision(image_bytes):
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=image_bytes)
    response = client.text_detection(image=image)
    texts = response.text_annotations
    if texts:
        return texts[0].description.strip()
    return ""

# Helper: Parse AI output robustly
def parse_gemini_output(raw_output):
    raw_output = raw_output.strip()

    # Remove code fences
    if raw_output.startswith("```"):
        raw_output = raw_output.strip("`").strip("json").strip()

    # Extract JSON array using regex
    match = re.search(r"\[.*\]", raw_output, re.DOTALL)
    if match:
        raw_output = match.group(0)

    # Replace single quotes with double quotes
    raw_output = raw_output.replace("'", '"')

    # Attempt JSON parsing
    try:
        data = json.loads(raw_output)
    except Exception as e:
        print("⚠️ JSON parsing failed:", e)
        print("RAW AI OUTPUT:\n", raw_output)
        data = []

    # Ensure all required keys exist
    required_keys = [
        "product", "quantity", "shipping_address",
        "customer_name", "phone", "company",
        "delivery_date", "payment_terms", "remarks"
    ]
    for item in data:
        for key in required_keys:
            if key not in item or not item[key]:
                item[key] = "unknown"

    return data

# POST: Text extraction (Batch)
@app.post("/extract_from_text")
def extract_from_text(batch: BatchTextData):
    global latest_file_path
    final_results = []

    try:
        for text in batch.input_texts:
            prompt = f"""
You are a structured data assistant. Extract all orders from the text below. 

⚠️ Extraction rules:
- Only return a JSON array. Do NOT include explanations or extra text.
- For each order, extract:
    - "product": product name only (no quantity/unit)
    - "quantity": number + unit (e.g., "5 boxes")
    - "delivery_date": full date (e.g., "25th July 2025"), not "tomorrow"
    - "shipping_address": full address
    - "customer_name": name of customer
    - "phone": phone number if available
    - "company": company name if mentioned
    - "payment_terms": payment method (COD, Credit card, PayPal, etc.)
    - "remarks": any notes
- If any field is missing, set value to "unknown".

Text to process:
{text}

Respond ONLY with a JSON array.
"""

            response = model.generate_content(prompt)
            raw_output = response.text.strip()
            parsed = parse_gemini_output(raw_output)
            final_results.extend(parsed)

        latest_file_path = save_to_excel(final_results)
        return {
            "message": "Batch text extraction successful",
            "data": final_results,
            "download_url": "/download_excel"
        }

    except Exception as e:
        return {"error": "Text extraction failed", "details": str(e)}

# POST: Image extraction (with OCR support)
@app.post("/extract_from_image")
async def extract_from_image(file: UploadFile = File(...)):
    global latest_file_path
    try:
        image_bytes = await file.read()
        ocr_text = extract_text_from_image_google_vision(image_bytes)

        if not ocr_text:
            return {"error": "OCR failed. Could not extract content from image."}

        prompt = f"""
You are an intelligent assistant. Extract all order items and customer details.

⚠️ Extraction rules:
- One row per product
- "product": product name only
- "quantity": number + unit
- "shipping_address": full address
- "customer_name": extract from context if not explicit
- "company": use business name if mentioned
- "phone": numeric only
- "delivery_date": full specific date
- "payment_terms": COD, Online, Credit, etc.
- "remarks": special delivery instructions
- If any field missing, set to "unknown"

Text to process:
{ocr_text}

Respond ONLY with a JSON array.
"""

        response = model.generate_content(prompt)
        result_text = response.text.strip()
        parsed = parse_gemini_output(result_text)

        latest_file_path = save_to_excel(parsed)
        return {
            "message": "Image extraction successful",
            "data": parsed,
            "download_url": "/download_excel"
        }

    except Exception as e:
        return {"error": "Image extraction failed", "details": str(e)}

# GET: Excel file download
@app.get("/download_excel")
def download_excel():
    if latest_file_path and os.path.exists(latest_file_path):
        return FileResponse(
            latest_file_path,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename=os.path.basename(latest_file_path)
        )
    return {"error": "No Excel file available for download."}
