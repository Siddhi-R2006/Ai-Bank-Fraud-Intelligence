import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# Pass certifi's CA bundle & add SSL fallback parameters
client = AsyncIOMotorClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    tlsAllowInvalidCertificates=True,  # Bypasses local network/firewall TLS inspection issues
    serverSelectionTimeoutMS=5000
)

db = client.get_database("abfis_db")

users_collection = db.get_collection("users")
reports_collection = db.get_collection("reports")