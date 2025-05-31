"""
Debug script to check avatar agent configuration
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=== Avatar Agent Configuration Debug ===\n")

# Check LiveKit configuration
print("1. LiveKit Configuration:")
lk_url = os.getenv("LIVEKIT_URL", "")
lk_key = os.getenv("LIVEKIT_API_KEY", "")
lk_secret = os.getenv("LIVEKIT_API_SECRET", "")
print(f"   LIVEKIT_URL: {'Set' if lk_url else 'Not set'}")
print(f"   LIVEKIT_API_KEY: {'Set' if lk_key else 'Not set'}")
print(f"   LIVEKIT_API_SECRET: {'Set' if lk_secret else 'Not set'}")

# Check API keys for services
print("\n2. Service API Keys:")
services = {
    "OPENAI_API_KEY": "OpenAI (for LLM)",
    "DEEPGRAM_API_KEY": "Deepgram (for Speech-to-Text)",
    "CARTESIA_API_KEY": "Cartesia (for Text-to-Speech)",
    "TAVUS_API_KEY": "Tavus (for Avatar)"
}

for key, service in services.items():
    value = os.getenv(key, "")
    print(f"   {service}: {'Set' if value else 'Not set'}")
    if value:
        print(f"      Length: {len(value)} chars")

# Check if .env file exists
env_exists = os.path.exists('.env')
print(f"\n3. .env file exists: {'Yes' if env_exists else 'No'}")

print("\n4. Required packages:")
packages = [
    "livekit",
    "livekit-agents",
    "livekit-plugins-openai",
    "livekit-plugins-deepgram",
    "livekit-plugins-cartesia",
    "livekit-plugins-tavus",
    "livekit-plugins-silero",
    "livekit-plugins-noise-cancellation",
]

for package in packages:
    try:
        __import__(package.replace("-", "_"))
        print(f"   ✅ {package}")
    except ImportError:
        print(f"   ❌ {package} - Not installed")

print("\n=== Troubleshooting Tips ===")
print("\n1. Make sure you have a .env file in the avatar-livekit directory with:")
print("   - LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET")
print("   - OPENAI_API_KEY")
print("   - DEEPGRAM_API_KEY")
print("   - CARTESIA_API_KEY")
print("   - TAVUS_API_KEY (optional, hardcoded in pipeline.py)")

print("\n2. Run the avatar agent with:")
print("   python pipeline.py connect --room avatar-room")

print("\n3. Make sure the room name matches between frontend and agent ('avatar-room')")

print("\n=== End of Debug ===") 