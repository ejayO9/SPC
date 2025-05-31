import json
from typing import List, Dict

def create_lyrics_json(
    song_title: str,
    artist: str,
    lyrics_text: str,
    output_file: str = "song_lyrics.json"
):
    """
    Helper function to create a lyrics JSON file.
    
    Args:
        song_title: Title of the song
        artist: Artist name
        lyrics_text: Full lyrics text with timestamps in format:
                    [0:02.000] First line of the song
                    [0:05.500] Second line continues
        output_file: Output JSON filename
    """
    
    lines = lyrics_text.strip().split('\n')
    lyrics_data = {
        "song_title": song_title,
        "artist": artist,
        "duration": 0,
        "lyrics": []
    }
    
    for i, line in enumerate(lines):
        if line.strip():
            # Parse timestamp and text
            if '[' in line and ']' in line:
                timestamp_str = line[line.index('[') + 1:line.index(']')]
                text = line[line.index(']') + 1:].strip()
                
                # Convert timestamp to seconds
                parts = timestamp_str.split(':')
                if len(parts) == 2:
                    minutes = int(parts[0])
                    seconds = float(parts[1])
                    start_time = minutes * 60 + seconds
                    
                    # Estimate end time (next line's start or +3 seconds)
                    if i < len(lines) - 1 and '[' in lines[i + 1]:
                        next_timestamp = lines[i + 1][lines[i + 1].index('[') + 1:lines[i + 1].index(']')]
                        next_parts = next_timestamp.split(':')
                        if len(next_parts) == 2:
                            next_minutes = int(next_parts[0])
                            next_seconds = float(next_parts[1])
                            end_time = next_minutes * 60 + next_seconds
                        else:
                            end_time = start_time + 3.0
                    else:
                        end_time = start_time + 3.0
                    
                    # Create word timings (simple estimation)
                    words = text.split()
                    word_duration = (end_time - start_time) / len(words) if words else 0
                    
                    word_data = []
                    current_word_time = start_time
                    
                    for word in words:
                        word_data.append({
                            "text": word,
                            "start_time": round(current_word_time, 3),
                            "end_time": round(current_word_time + word_duration * 0.9, 3)
                        })
                        current_word_time += word_duration
                    
                    lyrics_data["lyrics"].append({
                        "id": i + 1,
                        "text": text,
                        "start_time": round(start_time, 3),
                        "end_time": round(end_time, 3),
                        "words": word_data
                    })
                    
                    # Update total duration
                    lyrics_data["duration"] = max(lyrics_data["duration"], end_time)
    
    # Save to file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(lyrics_data, f, indent=2, ensure_ascii=False)
    
    print(f"Lyrics JSON saved to {output_file}")
    return lyrics_data


# Example usage:
if __name__ == "__main__":
    # Example lyrics with timestamps (LRC format)
    example_lyrics = """
[0:00.000] This is the first line of the song
[0:03.500] And here comes the second line
[0:07.000] The melody continues to flow
[0:10.500] With words that everybody knows
[0:14.000] Singing together in harmony
[0:17.500] Creating musical memories
    """
    
    # Generate the JSON file
    create_lyrics_json(
        song_title="Example Song",
        artist="Demo Artist",
        lyrics_text=example_lyrics,
        output_file="song_lyrics.json"
    )
    
    # You can also create lyrics with more precise word timing
    # by modifying the word_data calculation in the function 