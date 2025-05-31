import React, { useEffect, useState, useCallback } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useParticipants,
  useTracks,
  useRoomContext
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

// Avatar Display Component
function AvatarDisplay() {
  const participants = useParticipants();
  const tracks = useTracks(
    [Track.Source.Camera],
    { onlySubscribed: true }
  );
  const [waitingTime, setWaitingTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaitingTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Find the avatar participant (usually the first remote participant)
  const avatarTrack = tracks.find(track => 
    track.publication && 
    track.publication.kind === Track.Kind.Video &&
    track.participant && 
    track.participant.identity !== 'local'
  );

  return (
    <div className="avatar-display">
      {avatarTrack && avatarTrack.publication && avatarTrack.participant ? (
        <VideoTrack 
          trackRef={avatarTrack}
          className="avatar-video"
        />
      ) : (
        <div className="avatar-placeholder">
          <div className="avatar-loading">
            <div className="loading-spinner"></div>
            <p>Waiting for avatar to join...</p>
            <p className="debug-info">
              Participants: {participants.length} | 
              Video tracks: {tracks.filter(t => t.publication?.kind === Track.Kind.Video).length} |
              Time: {waitingTime}s
            </p>
            {waitingTime > 30 && (
              <div className="avatar-timeout-message">
                <p>Avatar is taking longer than expected.</p>
                <p>The Tavus service might be initializing. This can take up to 60 seconds.</p>
                <p>If it doesn't appear, check the avatar agent console for errors.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Main Avatar Agent Component
function AvatarAgent({ token, serverUrl }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [roomState, setRoomState] = useState('disconnected');

  // Handle connection state changes
  const handleConnected = useCallback(() => {
    console.log('Connected to LiveKit room');
    setIsConnected(true);
    setConnectionError(null);
    setRoomState('connected');
  }, []);

  const handleDisconnected = useCallback(() => {
    console.log('Disconnected from LiveKit room');
    setIsConnected(false);
    setRoomState('disconnected');
  }, []);

  const handleError = useCallback((error) => {
    console.error('LiveKit connection error:', error);
    setConnectionError(error?.message || 'Connection failed');
    setRoomState('error');
  }, []);

  // Validate props
  if (!token || !serverUrl) {
    return (
      <div className="avatar-agent-container">
        <div className="avatar-error">
          <p>Missing configuration: {!token ? 'Token' : 'Server URL'} is required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="avatar-agent-container">
      <div className="avatar-header">
        <h2>AI Assistant Avatar</h2>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'} ({roomState})</span>
        </div>
      </div>

      {connectionError && (
        <div className="avatar-error">
          <p>Error: {connectionError}</p>
        </div>
      )}

      <LiveKitRoom
        video={false}
        audio={false}
        token={token}
        serverUrl={serverUrl}
        connectOptions={{
          autoSubscribe: true,
        }}
        options={{
          videoCaptureDefaults: {
            deviceId: '',
            resolution: undefined,
          },
          audioCaptureDefaults: {
            deviceId: '',
          },
          publishDefaults: {
            videoEncoding: undefined,
            audioPreset: undefined,
          },
        }}
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
        onError={handleError}
        data-lk-theme="default"
        style={{ height: '100%' }}
      >
        <AvatarDisplay />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

export default AvatarAgent; 