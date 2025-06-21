from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pytesseract
from PIL import Image
import openai
import pandas as pd
import io
from dotenv import load_dotenv
import os

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# Allow frontend to talk to backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Input model for plain text
class TextData(BaseModel):
    input_text: str

@app.post("/extract_from_text")
def extract_from_text(data: TextData):
    prompt = f"""
    Extract the product name, quantity, and shipping address from the message below.
    Return as a JSON array like:
    [
      {{"product": "", "quantity": "", "address": ""}},
      ...
    ]

    Message: {data.input_text}
    """
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    result = eval(response.choices[0].message.content)
    df = pd.DataFrame(result)
    df.to_excel("outputs/structured_output.xlsx", index=False)
    return {"message": "Extraction successful", "data": result}

@app.post("/extract_from_image")
def extract_from_image(file: UploadFile = File(...)):
    image = Image.open(io.BytesIO(file.file.read()))
    text = pytesseract.image_to_string(image)
    return extract_from_text(TextData(input_text=text))
