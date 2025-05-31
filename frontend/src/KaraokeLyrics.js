import React, { useState, useEffect, useRef } from 'react';
import './KaraokeLyrics.css';

const KaraokeLyrics = ({ currentTime, isPlaying }) => {
  const [lyricsData, setLyricsData] = useState(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [nextLineIndex, setNextLineIndex] = useState(0);
  const currentLineRef = useRef(null);
  const nextLineRef = useRef(null);

  // Load lyrics data
  useEffect(() => {
    const loadLyrics = async () => {
      try {
        const response = await fetch('http://localhost:8000/lyrics');
        const data = await response.json();
        setLyricsData(data);
      } catch (error) {
        console.error('Error loading lyrics:', error);
      }
    };

    loadLyrics();
  }, []);

  // Update current line based on playback time
  useEffect(() => {
    if (!lyricsData || !lyricsData.lyrics) return;

    // Find the current line
    const currentLine = lyricsData.lyrics.findIndex((line, index) => {
      const nextLine = lyricsData.lyrics[index + 1];
      return currentTime >= line.start_time && 
             (nextLine ? currentTime < nextLine.start_time : true);
    });

    if (currentLine !== currentLineIndex) {
      setCurrentLineIndex(currentLine);
      setNextLineIndex(currentLine + 1);
    }
  }, [currentTime, lyricsData, currentLineIndex]);

  // Calculate word highlighting progress
  const getWordClass = (word, lineIndex) => {
    if (lineIndex < currentLineIndex) {
      return 'word sung';
    }
    
    if (lineIndex === currentLineIndex) {
      if (currentTime >= word.start_time) {
        if (currentTime <= word.end_time) {
          return 'word singing';
        } else {
          return 'word sung';
        }
      }
    }
    
    return 'word upcoming';
  };

  // Calculate inline style for word progress
  const getWordStyle = (word, lineIndex) => {
    if (lineIndex === currentLineIndex && 
        currentTime >= word.start_time && 
        currentTime <= word.end_time) {
      const progress = (currentTime - word.start_time) / (word.end_time - word.start_time);
      return {
        '--progress': progress
      };
    }
    return {};
  };

  // Calculate line progress for background fill
  const getLineProgress = (line) => {
    if (currentLineIndex >= 0 && line === lyricsData.lyrics[currentLineIndex]) {
      const lineStart = line.start_time;
      const lineEnd = line.end_time;
      const progress = Math.min(Math.max((currentTime - lineStart) / (lineEnd - lineStart), 0), 1);
      return progress;
    }
    return 0;
  };

  if (!lyricsData || !lyricsData.lyrics) {
    return <div className="karaoke-lyrics-container">Loading lyrics...</div>;
  }

  const currentLine = currentLineIndex >= 0 ? lyricsData.lyrics[currentLineIndex] : null;
  const nextLine = nextLineIndex < lyricsData.lyrics.length ? lyricsData.lyrics[nextLineIndex] : null;

  return (
    <div className="karaoke-lyrics-container">
      <div className="karaoke-header">
        <div className="song-info">
          <h3>{lyricsData.song_title}</h3>
          <p>{lyricsData.artist}</p>
        </div>
      </div>
      
      <div className="lyrics-display">
        {/* Current Line */}
        <div className="lyrics-line-wrapper current-line-wrapper">
          <div 
            className="progress-bar"
            style={{ width: `${currentLine ? getLineProgress(currentLine) * 100 : 0}%` }}
          />
          <div className="lyrics-line current-line" ref={currentLineRef}>
            {currentLine ? (
              currentLine.words ? (
                currentLine.words.map((word, wordIndex) => (
                  <React.Fragment key={wordIndex}>
                    <span
                      className={getWordClass(word, currentLineIndex)}
                      style={getWordStyle(word, currentLineIndex)}
                      data-text={word.text}
                    >
                      {word.text}
                    </span>
                    {wordIndex < currentLine.words.length - 1 && ' '}
                  </React.Fragment>
                ))
              ) : (
                <span className="word sung">{currentLine.text}</span>
              )
            ) : (
              <span className="word upcoming">Get ready...</span>
            )}
          </div>
        </div>

        {/* Next Line */}
        <div className="lyrics-line-wrapper next-line-wrapper">
          <div className="lyrics-line next-line" ref={nextLineRef}>
            {nextLine ? (
              nextLine.words ? (
                nextLine.words.map((word, wordIndex) => (
                  <React.Fragment key={wordIndex}>
                    <span
                      className="word upcoming"
                    >
                      {word.text}
                    </span>
                    {wordIndex < nextLine.words.length - 1 && ' '}
                  </React.Fragment>
                ))
              ) : (
                <span className="word upcoming">{nextLine.text}</span>
              )
            ) : (
              <span className="word upcoming"></span>
            )}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="time-indicator">
        <div className="time-bar">
          <div 
            className="time-progress"
            style={{ width: `${(currentTime / lyricsData.duration) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default KaraokeLyrics; 