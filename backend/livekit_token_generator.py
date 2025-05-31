"""
LiveKit Token Generator Example

This module shows how to generate LiveKit tokens for the frontend.
Add this to your FastAPI backend to enable proper token generation.
"""

import os
import time
from typing import Optional
from fastapi import HTTPException
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Load environment variables
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "")

# Check if livekit package is available
try:
    from livekit import api
    LIVEKIT_AVAILABLE = True
except ImportError:
    LIVEKIT_AVAILABLE = False
    print("WARNING: livekit package not installed. Run: pip install livekit")

def generate_livekit_token(
    room_name: str = "avatar-room",
    participant_name: str = "user",
    participant_identity: Optional[str] = None,
    expiration_time: int = 3600  # 1 hour in seconds
) -> str:
    """
    Generate a LiveKit access token for a participant.
    
    Args:
        room_name: Name of the LiveKit room
        participant_name: Display name for the participant
        participant_identity: Unique identifier for the participant (defaults to timestamp)
        expiration_time: Token expiration time in seconds
        
    Returns:
        JWT token string for LiveKit connection
    """
    if not LIVEKIT_AVAILABLE:
        raise HTTPException(
            status_code=500,
            detail="LiveKit package not installed. Please run: pip install livekit"
        )
    
    if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
        raise HTTPException(
            status_code=500,
            detail="LiveKit API credentials not configured. Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET environment variables or create a .env file"
        )
    
    # Generate unique identity if not provided
    if participant_identity is None:
        participant_identity = f"user-{int(time.time())}"
    
    try:
        # Create access token
        token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        
        # Configure token grants
        token.with_identity(participant_identity)\
            .with_name(participant_name)\
            .with_grants(api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True
            ))
        
        # Set expiration - use datetime.timedelta instead of integer seconds
        from datetime import datetime, timedelta
        token.with_ttl(timedelta(seconds=expiration_time))
        
        return token.to_jwt()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating token: {str(e)}"
        )


# Example FastAPI endpoint (add to your main.py):
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TokenRequest(BaseModel):
    room_name: str = "avatar-room"
    participant_name: str = "user"

@app.post("/generate-livekit-token")
async def generate_token(request: TokenRequest):
    try:
        token = generate_livekit_token(
            room_name=request.room_name,
            participant_name=request.participant_name
        )
        return {"token": token}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
""" 