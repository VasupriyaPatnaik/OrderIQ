from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import FileResponse
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

# POST: Text extraction (Batch)
@app.post("/extract_from_text")
def extract_from_text(batch: BatchTextData):
    global latest_file_path
    final_results = []

    try:
        for text in batch.input_texts:
            prompt = f"""
You are a structured data assistant. Extract details in the following format:

[
  {{
    "product": "...",
    "quantity": "...",
    "shipping_address": "...",
    "customer_name": "...",
    "phone": "...",
    "company": "...",
    "delivery_date": "...",  # MUST be a specific date like "25th July 2025"
    "payment_terms": "...",
    "remarks": "..."
  }}
]

👉 If any field is missing in the input, assign it the value "unknown".

Extract from:
{text}
"""
            response = model.generate_content(prompt)
            raw_output = response.text.strip()

            # Handle code block wrapping
            if raw_output.startswith("```"):
                raw_output = raw_output.strip("`").strip("json").strip()

            try:
                parsed = ast.literal_eval(raw_output)
                # Make sure every item has all keys, fill "unknown" if missing
                required_keys = [
                    "product", "quantity", "shipping_address",
                    "customer_name", "phone", "company",
                    "delivery_date", "payment_terms", "remarks"
                ]
                for item in parsed:
                    for key in required_keys:
                        if key not in item:
                            item[key] = "unknown"
                    final_results.append(item)
            except Exception as parse_err:
                return {
                    "error": "Invalid format received from model",
                    "raw_output": raw_output,
                    "details": str(parse_err)
                }

        latest_file_path = save_to_excel(final_results)
        return {
            "message": "Batch text extraction successful",
            "data": final_results,
            "download_url": "/download_excel"
        }
    except Exception as e:
        return {"error": "Text extraction failed", "details": str(e)}

# POST: Image extraction
@app.post("/extract_from_image")
async def extract_from_image(file: UploadFile = File(...)):
    global latest_file_path
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))

        prompt = """
Extract structured information from the fax image.

Return as:
[
  {
    "product": "...",
    "quantity": "...",
    "shipping_address": "...",
    "customer_name": "...",
    "phone": "...",
    "company": "...",
    "delivery_date": "...",
    "payment_terms": "...",
    "remarks": "..."
  }
]

Fill "unknown" for any missing values. Date must be specific like "25th July 2025".
"""

        response = model.generate_content([prompt, image])
        result_text = response.text.strip()

        if result_text.startswith("```"):
            result_text = result_text.strip("`").strip("json").strip()

        result = ast.literal_eval(result_text)

        required_keys = [
            "product", "quantity", "shipping_address",
            "customer_name", "phone", "company",
            "delivery_date", "payment_terms", "remarks"
        ]
        for item in result:
            for key in required_keys:
                if key not in item:
                    item[key] = "unknown"

        latest_file_path = save_to_excel(result)
        return {
            "message": "Image extraction successful",
            "data": result,
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
