import json
import librosa

# Load studio song (vocals only or full mix)
filename = 'songs\song.mp3'  # place your song file here
sr = 44100

y, _ = librosa.load(filename, sr=sr, mono=True)

# Compute fundamental frequency (pitch) contour via pYIN
fmin = librosa.note_to_hz('C2')
fmax = librosa.note_to_hz('C7')

f0, voiced_flag, voiced_probs = librosa.pyin(
    y,
    fmin=fmin,
    fmax=fmax,
    sr=sr,
    frame_length=2048,
    hop_length=512  
)

# Generate timestamps for each frame
times = librosa.times_like(f0, sr=sr, hop_length=512)

# Pack into JSON-friendly structure
pitch_data = [
    {"timestamp": float(t), "pitch": float(f0_i or 0.0)}
    for t, f0_i in zip(times, f0)
]

with open('reference_pitch.json', 'w') as f:
    json.dump(pitch_data, f)

print(f"Saved {len(pitch_data)} pitch points to reference_pitch.json")