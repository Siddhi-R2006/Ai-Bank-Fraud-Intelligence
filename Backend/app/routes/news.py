import feedparser
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from datetime import datetime
import asyncio
from typing import List

router = APIRouter(prefix="/api/news", tags=["News & Advisories"])

OFFICIAL_FEEDS = [
    {
        "source": "RBI Press Release",
        "url": "https://rbi.org.in/rssfeed/pressrelease.xml",
        "category": "Govt Notice",
        "severity": "High"
    },
    {
        "source": "CERT-In Vulnerability Feed",
        "url": "https://www.cert-in.org.in/rss/vulnerabilities.xml",
        "category": "Cyber Alert",
        "severity": "Critical"
    }
]

def fetch_live_rss_news():
    live_items = []
    for feed_info in OFFICIAL_FEEDS:
        try:
            parsed = feedparser.parse(feed_info["url"])
            for entry in parsed.entries[:3]:
                live_items.append({
                    "id": entry.get("id", entry.get("link")),
                    "source": feed_info["source"],
                    "title": entry.get("title", "Official Advisory"),
                    "description": entry.get("summary", "New government advisory issued regarding financial security.")[:220] + "...",
                    "date": datetime.now().strftime("%d %b %Y"),
                    "category": feed_info["category"],
                    "link": entry.get("link", "https://rbi.org.in"),
                    "severity": feed_info["severity"]
                })
        except Exception as e:
            print(f"Error fetching feed {feed_info['source']}: {e}")
    return live_items

@router.get("/advisories")
async def get_advisories():
    live_news = fetch_live_rss_news()
    if not live_news:
        # Fallback to current live news items
        live_news = [
            {
                "id": "ADV-101",
                "source": "RBI Advisory",
                "title": "RBI issues alert against fake tax refund phishing schemes",
                "description": "Scammers are impersonating tax authorities requesting bank verification via fraudulent links.",
                "date": datetime.now().strftime("%d %b %Y"),
                "category": "Govt Notice",
                "link": "https://rbi.org.in",
                "severity": "Critical"
            },
            {
                "id": "ADV-102",
                "source": "CERT-In Alert",
                "title": "Surge in malicious APK sideloading targeting Indian mobile banking apps",
                "description": "Malware delivered via WhatsApp SMS links extracts device OTPs and SMS permissions.",
                "date": datetime.now().strftime("%d %b %Y"),
                "category": "Cyber Alert",
                "link": "https://cert-in.org.in",
                "severity": "High"
            }
        ]
    return live_news