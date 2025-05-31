"""
Setup script for LiveKit credentials
"""

import os

def create_env_file():
    """Create a .env file with LiveKit credentials"""
    
    print("\n=== LiveKit Setup ===")
    print("\nTo use the avatar feature, you need LiveKit API credentials.")
    print("You can get them from: https://cloud.livekit.io")
    print("\nOr use these test credentials (for development only):\n")
    
    # Example test credentials (replace with your own)
    print("LIVEKIT_API_KEY=APItest123")
    print("LIVEKIT_API_SECRET=secrettest456\n")
    
    create_file = input("Do you want to create a .env file? (y/n): ").lower()
    
    if create_file == 'y':
        api_key = input("Enter your LIVEKIT_API_KEY (or press Enter for test key): ").strip()
        api_secret = input("Enter your LIVEKIT_API_SECRET (or press Enter for test secret): ").strip()
        
        # Use test credentials if not provided
        if not api_key:
            api_key = "APItest123"
        if not api_secret:
            api_secret = "secrettest456"
        
        env_content = f"""# LiveKit API Credentials
# Get these from your LiveKit Cloud dashboard: https://cloud.livekit.io
LIVEKIT_API_KEY={api_key}
LIVEKIT_API_SECRET={api_secret}

# Optional: LiveKit Server URL (defaults to LiveKit Cloud)
# LIVEKIT_SERVER_URL=wss://your-server.livekit.cloud
"""
        
        with open('.env', 'w') as f:
            f.write(env_content)
        
        print("\n✅ Created .env file successfully!")
        print("\nNext steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Restart your backend server: python main.py")
        print("3. Try generating a token again from the frontend")
    else:
        print("\nTo fix the error manually:")
        print("1. Create a .env file in the backend directory")
        print("2. Add your LiveKit credentials:")
        print("   LIVEKIT_API_KEY=your-api-key")
        print("   LIVEKIT_API_SECRET=your-api-secret")
        print("3. Install python-dotenv: pip install python-dotenv")
        print("4. Restart your backend server")

if __name__ == "__main__":
    create_env_file() 