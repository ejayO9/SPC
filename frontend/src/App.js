import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const BACKEND_URL = 'http://localhost:8000';
const WS_URL = 'ws://localhost:8000/ws';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [referencePitch, setReferencePitch] = useState([]);
  const [userPitchData, setUserPitchData] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [problemSections, setProblemSections] = useState([]);
  const [performanceComplete, setPerformanceComplete] = useState(false);
  
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const processorRef = useRef(null);
  const wsRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Load reference pitch data
  useEffect(() => {
    const loadReferencePitch = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/reference-pitch`);
        setReferencePitch(response.data);
        
        // Calculate duration from reference pitch data
        if (response.data.length > 0) {
          const lastPoint = response.data[response.data.length - 1];
          setDuration(lastPoint.timestamp);
        }
      } catch (error) {
        console.error('Error loading reference pitch:', error);
      }
    };
    
    loadReferencePitch();
  }, []);

  // WebSocket connection
  useEffect(() => {
    if (isRecording) {
      wsRef.current = new WebSocket(WS_URL);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'pitch_update') {
          // Update user pitch data
          const newUserPitch = data.user_pitch.map(point => ({
            ...point,
            timestamp: point.timestamp + data.time_offset
          }));
          
          setUserPitchData(prev => [...prev, ...newUserPitch]);
          
          // Check for problem sections
          const problems = data.comparisons.filter(comp => 
            comp.deviation_percentage && comp.deviation_percentage > 30
          );
          
          if (problems.length > 0) {
            setProblemSections(prev => [...prev, ...problems]);
          }
        } else if (data.type === 'performance_complete') {
          setPerformanceComplete(true);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
      };
    } else {
      if (wsRef.current) {
        wsRef.current.close();
      }
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isRecording]);

  // Audio playback time update
  useEffect(() => {
    if (audioRef.current) {
      const updateTime = () => {
      setCurrentTime(audioRef.current.currentTime);
        
        // Send current position to backend
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'song_position',
            position: audioRef.current.currentTime
          }));
        }
        
        if (isPlaying) {
          animationFrameRef.current = requestAnimationFrame(updateTime);
        }
      };
      
      if (isPlaying) {
        updateTime();
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Start recording and playing
  const startPerformance = async () => {
    try {
      // Reset data
      setUserPitchData([]);
      setProblemSections([]);
      setPerformanceComplete(false);
      
      // Start audio playback
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setIsPlaying(true);
      }
      
      // Start microphone recording
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      mediaStreamRef.current = stream;
      
      // Create audio context without specifying sample rate - let it use default
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // Create script processor for capturing audio chunks
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      processor.onaudioprocess = (e) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const float32Array = new Float32Array(inputData);
          
          // Convert to base64 for transmission
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(float32Array.buffer)));
          
          wsRef.current.send(JSON.stringify({
            type: 'audio_chunk',
            audio_data: base64Audio
          }));
        }
      };
      
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting performance:', error);
    }
  };

  // Stop recording and playing
  const stopPerformance = () => {
    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    // Stop microphone recording
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    // Send end message
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'end_performance'
      }));
    }
    
    setIsRecording(false);
  };

  // Prepare data for visualization
  const prepareChartData = () => {
    const startTime = Math.max(0, currentTime - 2); // Show 2 seconds before current time
    const endTime = Math.min(duration, currentTime + 3); // Show 3 seconds ahead
    
    // Filter reference pitch data
    const filteredReference = referencePitch.filter(
      point => point.timestamp >= startTime && point.timestamp <= endTime
    );
    
    // Filter user pitch data
    const filteredUser = userPitchData.filter(
      point => point.timestamp >= startTime && point.timestamp <= endTime
    );
    
    // Combine data for chart
    const chartData = [];
    const timeStep = 0.05; // 50ms intervals
    
    for (let time = startTime; time <= endTime; time += timeStep) {
      const refPoint = filteredReference.find(
        p => Math.abs(p.timestamp - time) < timeStep / 2
      );
      const userPoint = filteredUser.find(
        p => Math.abs(p.timestamp - time) < timeStep / 2
      );
      
      chartData.push({
        time: time,
        reference: refPoint ? refPoint.pitch : null,
        user: userPoint ? userPoint.pitch : null
      });
    }
    
    return chartData;
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Find problem sections in current view
  const getCurrentProblemSections = () => {
    const grouped = [];
    let currentSection = null;
    
    problemSections.forEach((problem) => {
      if (currentSection === null || 
          problem.timestamp - currentSection.endTime > 0.5) {
        currentSection = {
          startTime: problem.timestamp,
          endTime: problem.timestamp,
          avgDeviation: problem.deviation_percentage
        };
        grouped.push(currentSection);
      } else {
        currentSection.endTime = problem.timestamp;
        currentSection.avgDeviation = 
          (currentSection.avgDeviation + problem.deviation_percentage) / 2;
      }
    });
    
    return grouped.filter(section => 
      section.endTime - section.startTime > 0.5
    );
  };

  const chartData = prepareChartData();

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Duolingo For Singing</h1>
      </header>
      
      <main className="App-main">
        <div className="controls">
          <button 
            onClick={isRecording ? stopPerformance : startPerformance}
            className={`control-button ${isRecording ? 'stop' : 'start'}`}
          >
            {isRecording ? 'Stop Performance' : 'Start Performance'}
          </button>
          
          <div className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        
        <div className="pitch-visualizer">
          <h2>Pitch Comparison</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                domain={[currentTime - 2, currentTime + 3]}
                tickFormatter={formatTime}
              />
              <YAxis 
                domain={[100, 800]}
                label={{ value: 'Pitch (Hz)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={(value) => `Time: ${formatTime(value)}`}
                formatter={(value) => value ? `${value.toFixed(1)} Hz` : 'N/A'}
              />
              
              {/* Current time indicator */}
              <ReferenceLine x={currentTime} stroke="#FF0080" strokeWidth={3} strokeDasharray="5 5" />
              
              {/* Reference pitch line */}
              <Line 
                type="monotone" 
                dataKey="reference" 
                stroke="#FFA500" 
                strokeWidth={3}
                dot={false}
                connectNulls={false}
                name="Original"
              />
              
              {/* User pitch line */}
              <Line 
                type="monotone" 
                dataKey="user" 
                stroke="#00FF00" 
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name="Your Voice"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {performanceComplete && (
          <div className="performance-analysis">
            <h2>Performance Analysis</h2>
            {getCurrentProblemSections().length > 0 ? (
              <div className="problem-sections">
                <h3>Areas for Improvement:</h3>
                <ul>
                  {getCurrentProblemSections().map((section, index) => (
                    <li key={index}>
                      {formatTime(section.startTime)} - {formatTime(section.endTime)}: 
                      Average deviation {section.avgDeviation.toFixed(1)}%
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>Great job! Your pitch accuracy was excellent!</p>
            )}
          </div>
        )}
        
        {/* Hidden audio element */}
        <audio 
          ref={audioRef} 
          src={`${BACKEND_URL}/song/song.mp3`}
          onEnded={stopPerformance}
        />
      </main>
    </div>
  );
}

export default App;