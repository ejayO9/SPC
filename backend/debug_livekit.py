"""
Debug script to check LiveKit configuration
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=== LiveKit Configuration Debug ===\n")

# Check environment variables
api_key = os.getenv("LIVEKIT_API_KEY", "")
api_secret = os.getenv("LIVEKIT_API_SECRET", "")

print(f"1. LIVEKIT_API_KEY present: {'Yes' if api_key else 'No'}")
print(f"   Value length: {len(api_key)} characters")
print(f"   First 5 chars: {api_key[:5]}..." if len(api_key) > 5 else f"   Value: {api_key}")

print(f"\n2. LIVEKIT_API_SECRET present: {'Yes' if api_secret else 'No'}")
print(f"   Value length: {len(api_secret)} characters")
print(f"   First 5 chars: {api_secret[:5]}..." if len(api_secret) > 5 else f"   Value: {api_secret}")

# Check if .env file exists
env_exists = os.path.exists('.env')
print(f"\n3. .env file exists: {'Yes' if env_exists else 'No'}")
if env_exists:
    print(f"   .env file location: {os.path.abspath('.env')}")

# Test token generation
print("\n4. Testing token generation...")
try:
    from livekit_token_generator import generate_livekit_token
    token = generate_livekit_token()
    print(f"   ✅ Token generated successfully!")
    print(f"   Token length: {len(token)} characters")
    print(f"   Token preview: {token[:20]}...")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Check if livekit package is properly installed
print("\n5. LiveKit package check:")
try:
    import livekit
    print(f"   ✅ livekit package version: {livekit.__version__}")
    from livekit import api
    print(f"   ✅ livekit.api module imported successfully")
except Exception as e:
    print(f"   ❌ Error importing livekit: {e}")

print("\n=== End of Debug ===") 