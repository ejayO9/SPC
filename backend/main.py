import time
import json
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn
import aubio

app = FastAPI()

# Load precomputed reference pitch data
with open('reference_pitch.json') as f:
    reference_pitch = json.load(f)

# Aubio pitch detector settings
SAMPLE_RATE = 44100
FRAME_SIZE = 1024
HOP_SIZE = 512
pitch_detector = aubio.pitch(
    method="default",
    buf_size=FRAME_SIZE,
    hop_size=HOP_SIZE,
    samplerate=SAMPLE_RATE
)
pitch_detector.set_unit("Hz")
pitch_detector.set_silence(-40)

@app.websocket('/ws/audio')
async def audio_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive raw audio chunk from frontend
            data = await websocket.receive_bytes()
            # Convert bytes to numpy array (16-bit PCM little endian)
            audio = np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0
            # Process frames for pitch
            pitches = []
            for i in range(0, len(audio), HOP_SIZE):
                frame = audio[i:i+HOP_SIZE]
                if len(frame) < HOP_SIZE:
                    break
                pitch = pitch_detector(frame)[0]
                if pitch > 0:
                    pitches.append(pitch)
            # Compute a robust estimate of pitch for this chunk
            user_pitch = float(np.median(pitches)) if pitches else 0.0
            # Timestamp as elapsed song time (client should sync)
            timestamp = time.time()
            # Send user pitch back
            await websocket.send_json({
                "timestamp": timestamp,
                "user_pitch": user_pitch
            })
    except WebSocketDisconnect:
        print("Client disconnected")

@app.get('/reference_pitch.json')
async def get_reference():
    # Serve the static JSON to frontend
    return reference_pitch

if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)