import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

function App() {
  const [refData, setRefData] = useState([]);
  const [userData, setUserData] = useState([]);
  const wsRef = useRef(null);
  const recorderRef = useRef(null);

  // Load reference pitch
  useEffect(() => {
    fetch('http://localhost:8000/reference_pitch.json')
      .then(res => res.json())
      .then(data => setRefData(data));

    // Open WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws/audio');
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      // Append new user pitch
      setUserData(prev => [...prev, { timestamp: msg.timestamp, pitch: msg.user_pitch }]);
    };
    wsRef.current = ws;
    return () => {
      ws.close();
    };
  }, []);

  // Start sending audio
  const startCapture = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(e.data);
      }
    };
    recorder.start(200); // emit 200ms chunks
    recorderRef.current = recorder;
  };
  const stopCapture = () => {
    recorderRef.current && recorderRef.current.stop();
  };

  // Prepare chart data
  const chartData = {
    datasets: [
      {
        label: 'Reference Pitch',
        data: refData.map(pt => ({ x: pt.timestamp, y: pt.pitch })),
        borderColor: 'orange',
        pointRadius: 0,
      },
      {
        label: 'Your Pitch',
        data: userData.map(pt => ({ x: pt.timestamp, y: pt.pitch })),
        borderColor: 'cyan',
        pointRadius: 1,
      }
    ]
  };
  const options = {
    animation: false,
    scales: {
      x: { type: 'linear', title: { display: true, text: 'Time (s)' } },
      y: { title: { display: true, text: 'Pitch (Hz)' } }
    }
  };

  return (
    <div style={{ width: '90%', margin: 'auto', textAlign: 'center' }}>
      <h2>AI Singing Coach</h2>
      <Line data={chartData} options={options} />
      <div style={{ marginTop: '1em' }}>
        <button onClick={startCapture}>Start Singing</button>
        <button onClick={stopCapture} style={{ marginLeft: '1em' }}>Stop</button>
      </div>
    </div>
  );
}

export default App;