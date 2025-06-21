from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pytesseract
from PIL import Image
import pandas as pd
import io
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY") 

# Use the OpenAI v1 client
client = OpenAI(api_key=api_key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class TextData(BaseModel):
    input_text: str

@app.post("/extract_from_text")
def extract_from_text(data: TextData):
    prompt = f"""
    Extract product name, quantity, and shipping address from the following order message.
    Return JSON in this format:
    [
      {{"product": "Amul Butter", "quantity": "10", "address": "Address here"}},
      ...
    ]

    Message: {data.input_text}
    """

    response = client.chat.completions.create(
    model="gpt-3.5-turbo",   
    messages=[{"role": "user", "content": prompt}],
    temperature=0
    )

    content = response.choices[0].message.content
    try:
        result = eval(content)
        df = pd.DataFrame(result)
        df.to_excel("outputs/structured_output.xlsx", index=False)
        return {"message": "Extraction successful", "data": result}
    except Exception as e:
        return {"error": "Failed to parse LLM response", "raw": content, "exception": str(e)}

@app.post("/extract_from_image")
def extract_from_image(file: UploadFile = File(...)):
    image = Image.open(io.BytesIO(file.file.read()))
    text = pytesseract.image_to_string(image)
    return extract_from_text(TextData(input_text=text))
