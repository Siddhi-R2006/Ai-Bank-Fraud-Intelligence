import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load .env file from Backend/app/.env
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


class ChatRequest(BaseModel):
    message: str


SYSTEM_INSTRUCTION = """
You are ABFIS AI, an expert customer support and cyber fraud helpline assistant for a digital banking system.
Your job is to assist users with:
1. Cyber fraud reporting (Helpline: 1930, official portal: cybercrime.gov.in).
2. Safe banking guidelines (UPI scams, phishing, card blocking).
3. General banking support (disputing transactions, reporting lost cards).

Guidelines:
- Keep answers concise, clear, and action-oriented.
- If a user reports an ongoing fraud or unauthorized transaction, immediately tell them to call 1930 and block their card/account.
- Never ask for personal sensitive credentials such as CVV, passwords, or full OTPs.
- Maintain a helpful, polite, and reassuring tone.
"""


@router.post("/ask")
async def ask_chatbot(payload: ChatRequest):
    if not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty."
        )

    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        api_key = api_key.strip()

    if not api_key:
        print("\n❌ CHATBOT ERROR: GEMINI_API_KEY is missing from .env file!\n")
        return {
            "response": "Configuration Error: GEMINI_API_KEY is missing from your .env file."
        }

    client = genai.Client(api_key=api_key)

    # Priority queue using currently supported model identifiers for your API Key
    models_to_try = [
        "gemini-3.6-flash",
        "gemini-1.5-flash-8b",
    ]

    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=payload.message,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    temperature=0.3,
                    max_output_tokens=800,
                ),
            )
            return {"response": response.text}

        except Exception as e:
            print(f"\n⚠️ Model {model_name} failed: {type(e).__name__} -> {e}")
            continue

    return {
        "response": "Our AI service is currently experiencing high demand. For immediate fraud reporting or assistance, please call the National Cyber Crime Helpline at 1930 or visit cybercrime.gov.in."
    }