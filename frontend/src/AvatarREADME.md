# Avatar Agent Integration

This React app now includes integration with the LiveKit avatar agent from the `avatar-livekit/pipeline.py` backend.

## Setup

1. **Environment Variables**
   Create a `.env` file in the `frontend` directory with the following variables:
   ```
   REACT_APP_LIVEKIT_SERVER_URL=wss://your-livekit-server.livekit.cloud
   REACT_APP_LIVEKIT_API_KEY=your-api-key
   REACT_APP_LIVEKIT_API_SECRET=your-api-secret
   ```

2. **Backend Setup**
   - Make sure your avatar-livekit backend is running:
     ```bash
     cd avatar-livekit
     python pipeline.py
     ```

3. **Token Generation**
   The app needs a LiveKit token to connect to the room. You have two options:
   
   a. **Use the demo token button** (for testing only)
   b. **Implement proper token generation** in your backend:
      - Add an endpoint in your backend that generates LiveKit tokens
      - Update the `generateDemoToken` function in App.js to call your endpoint

## Usage

1. Start the React app:
   ```bash
   npm start
   ```

2. Click the "Show AI Assistant Avatar" button below the pitch chart

3. Click "Generate Demo Token" or implement proper token generation

4. The avatar will appear and you can interact with it via voice

## Features

- **Voice Interaction**: The avatar uses OpenAI for conversation and Tavus for the visual avatar
- **Real-time Connection Status**: Shows whether you're connected to the LiveKit room
- **Modern UI**: Dark theme with purple accents matching the app's design
- **Toggle Visibility**: Show/hide the avatar as needed

## Architecture

- **AvatarAgent.js**: React component handling the LiveKit room connection and avatar display
- **App.js**: Main app component with avatar integration
- **LiveKit**: WebRTC infrastructure for real-time audio/video
- **Tavus**: Avatar rendering service

## Troubleshooting

1. **Avatar not appearing**: Check that the backend is running and the token is valid
2. **Connection errors**: Verify your LiveKit server URL and credentials
3. **No audio**: Ensure your browser has microphone permissions 