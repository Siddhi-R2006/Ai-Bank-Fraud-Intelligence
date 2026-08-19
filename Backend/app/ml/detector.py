import os
import re
import joblib
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/detector", tags=["Fraud Detector ML"])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model_weights", "fraud_detector_model.pkl")

if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
    except Exception as e:
        model = None
else:
    model = None


class PredictRequest(BaseModel):
    text: str
    location: str = "Mumbai"  # Location parameter for alert context


def preprocess_input(text: str) -> str:
    cleaned = re.sub(r'https?://', 'http ', text)
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', cleaned)
    return cleaned.lower()


def detect_input_type(text: str) -> str:
    text_strip = text.strip()
    if (
        text_strip.startswith("http://") 
        or text_strip.startswith("https://") 
        or re.match(r'^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}', text_strip)
    ):
        return "URL"
    elif "Subject:" in text or "From:" in text or "Dear" in text or len(text.split()) > 30:
        return "Email"
    return "SMS / Text Message"


def generate_explanation(level: str, input_type: str, hits: list, risk_score: int) -> str:
    """Generates a human-readable summary explaining why the input got its risk score."""
    if level == "Critical":
        explanation = f"This {input_type} exhibits strong indicators of a malicious phishing or scam attempt. "
        if hits:
            explanation += f"It contains high-risk trigger words ({', '.join(hits[:3])}) often used to manufacture urgency or harvest credentials."
        else:
            explanation += "The structural language closely mirrors verified fraud patterns in our dataset."
    elif level == "Suspicious":
        explanation = f"This {input_type} shows moderate risk factors. "
        if hits:
            explanation += f"Caution is advised due to flags like '{hits[0]}'. Verify the sender before taking action."
        else:
            explanation += "While not explicitly malicious, the structure requires verification before clicking links or sharing data."
    else:
        explanation = f"This {input_type} appears to be legitimate notification or standard communication with no active phishing markers detected."

    return explanation


@router.post("/predict")
async def predict_fraud(payload: PredictRequest):
    if model is None:
        raise HTTPException(
            status_code=500, 
            detail="ML Model artifact is not loaded. Train the model using train_from_datasets.py first."
        )

    text_input = payload.text.strip()
    if not text_input:
        return {
            "risk_score": 0,
            "level": "Safe",
            "probability": 0.0,
            "detected_type": "Unknown",
            "signals": [],
            "explanation": "No text provided for analysis."
        }

    input_type = detect_input_type(text_input)
    cleaned_input = preprocess_input(text_input)

    probabilities = model.predict_proba([cleaned_input])[0]
    fraud_prob = float(probabilities[1])
    risk_score = int(fraud_prob * 100)

    if risk_score >= 70:
        level = "Critical"
    elif risk_score >= 40:
        level = "Suspicious"
    else:
        level = "Safe"

    keywords = ["kyc", "urgent", "otp", "verify", "suspend", "refund", "prize", "won", "link", "update", "http", "bit.ly", "xyz", "storage", "quota"]
    hits = [kw for kw in keywords if kw in text_input.lower()]

    explanation = generate_explanation(level, input_type, hits, risk_score)

    response_data = {
        "risk_score": risk_score,
        "level": level,
        "probability": round(fraud_prob, 4),
        "detected_type": input_type,
        "signals": hits,
        "explanation": explanation
    }

    # Broadcast ONLY if the detector identifies a threat (Critical or Suspicious)
    if level in ["Critical", "Suspicious"]:
        try:
            from main import manager
            alert_payload = {
                "time": datetime.now().strftime("%H:%M:%S"),
                "t": f"AI Detector ({input_type}): {text_input[:30]}...",
                "loc": payload.location,
                "level": "Critical" if level == "Critical" else "High"
            }
            await manager.broadcast(alert_payload)
        except Exception as e:
            print(f"WebSocket broadcast warning: {e}")

    return response_data