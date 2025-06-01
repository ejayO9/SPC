import React, { useEffect, useState, useCallback } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  // VideoTrack, // Removed
  // useParticipants, // Removed
  // useTracks, // Removed
  // useRoomContext // Removed
} from '@livekit/components-react';
import '@livekit/components-styles';
// import { Track } from 'livekit-client'; // Removed

// Avatar Display Component - Entire component removed
// function AvatarDisplay() { ... }

// Main Avatar Agent Component
function AvatarAgent({ token, serverUrl }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [roomState, setRoomState] = useState('disconnected');

  // Handle connection state changes
  const handleConnected = useCallback(() => {
    console.log('Connected to LiveKit room for voice agent');
    setIsConnected(true);
    setConnectionError(null);
    setRoomState('connected');
  }, []);

  const handleDisconnected = useCallback(() => {
    console.log('Disconnected from LiveKit room for voice agent');
    setIsConnected(false);
    setRoomState('disconnected');
  }, []);

  const handleError = useCallback((error) => {
    console.error('LiveKit connection error for voice agent:', error);
    setConnectionError(error?.message || 'Connection failed');
    setRoomState('error');
  }, []);

  // Validate props
  if (!token || !serverUrl) {
    return (
      <div className="avatar-agent-container">
        <div className="avatar-error">
          <p>Missing configuration for Voice Agent: {!token ? 'Token' : 'Server URL'} is required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="avatar-agent-container">
      {/* Header can be simplified or removed if not needed for a voice-only agent */}
      <div className="avatar-header">
        <h2>AI Assistant</h2>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Connected' : `Connecting... (${roomState})`}</span>
        </div>
      </div>

      {connectionError && (
        <div className="avatar-error">
          <p>Connection Error: {connectionError}</p>
        </div>
      )}

      <LiveKitRoom
        video={false} // Explicitly false
        audio={true}  // Agent needs to send audio
        token={token}
        serverUrl={serverUrl}
        connectOptions={{
          autoSubscribe: true,
        }}
        // Removed options related to videoCaptureDefaults, audioCaptureDefaults, publishDefaults as agent likely handles this
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
        onError={handleError}
        data-lk-theme="default"
        style={{ display: 'none' }} // The component itself doesn't need to be visible
      >
        {/* <AvatarDisplay /> // Removed */}
        <RoomAudioRenderer /> {/* This is crucial for hearing the agent */}
      </LiveKitRoom>
    </div>
  );
}

export default AvatarAgent; 