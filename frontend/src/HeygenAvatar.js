import React, { useEffect, useRef, useState } from 'react';
import StreamingAvatar, { StreamingEvents, TaskType } from '@heygen/streaming-avatar';

const HeygenAvatar = ({ sessionToken, avatarName, voiceId, initialMessage }) => {
  const videoRef = useRef(null);
  const avatarRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [debugMessage, setDebugMessage] = useState('Initializing...');

  useEffect(() => {
    if (!sessionToken || !avatarName || !voiceId) {
      setDebugMessage('Missing token, avatar name, or voice ID.');
      return;
    }

    const initAvatar = async () => {
      try {
        setDebugMessage('Creating StreamingAvatar instance...');
        const avatar = new StreamingAvatar({
          token: sessionToken,
          // basePath: 'https://api.heygen.com' // Optional: SDK defaults to this
        });
        avatarRef.current = avatar;

        avatar.on(StreamingEvents.STREAM_READY, (event) => {
          setDebugMessage('Stream is ready. Attaching to video element.');
          console.log('Heygen Stream Ready:', event);
          if (videoRef.current && event.detail && event.detail.stream) {
            videoRef.current.srcObject = event.detail.stream;
            videoRef.current.play().catch(e => console.error("Error playing video:", e));
            
            // Speak an initial message if provided and session is ready
            if (initialMessage && sessionId) {
              avatar.speak({
                sessionId: sessionId,
                text: initialMessage,
                taskType: TaskType.REPEAT, // Or TaskType.TALK for LLM-generated response
              }).catch(e => console.error('Error speaking initial message:', e));
            }
          }
        });

        avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
          setDebugMessage('Avatar started talking.');
          console.log('Heygen Avatar Started Talking');
        });

        avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
          setDebugMessage('Avatar stopped talking.');
          console.log('Heygen Avatar Stopped Talking');
        });
        
        avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
          setDebugMessage('Stream disconnected.');
          console.log('Heygen Stream Disconnected');
        });

        avatar.on(StreamingEvents.ERROR, (error) => {
          setDebugMessage(`Error: ${error.message}`);
          console.error('Heygen SDK Error:', error);
        });
        
        setDebugMessage('Starting avatar session...');
        const startRequest = {
          avatarName: avatarName,
          quality: 'medium', // Or 'low', 'high'
          voice: {
            voiceId: voiceId,
            model: 'eleven_multilingual_v2',
            elevenlabsSettings: {
              stability: 0.75,
              similarity_boost: 0.5,
              style: 0.5,
            },
            // rate: 1.0, // Optional: 0.5 ~ 1.5
            // emotion: VoiceEmotion.FRIENDLY, // Optional
          },
          // knowledgeId: 'your-knowledge-id', // Optional for TaskType.TALK
          // disableIdleTimeout: false, // Optional
        };
        
        const sessionData = await avatar.createStartAvatar(startRequest);
        setDebugMessage(`Session started: ${sessionData.session_id}`);
        console.log('Heygen Session Started:', sessionData);
        setSessionId(sessionData.session_id);

        // If initialMessage was provided but sessionId wasn't ready when stream_ready fired
        if (initialMessage && videoRef.current && videoRef.current.srcObject) {
            avatar.speak({
              sessionId: sessionData.session_id,
              text: initialMessage,
              taskType: TaskType.REPEAT,
            }).catch(e => console.error('Error speaking initial message (post-session start):', e));
        }


      } catch (error) {
        setDebugMessage(`Initialization error: ${error.message}`);
        console.error('Error initializing Heygen Avatar:', error);
      }
    };

    initAvatar();

    return () => {
      if (avatarRef.current) {
        setDebugMessage('Stopping avatar session...');
        avatarRef.current.stopAvatar()
          .then(() => console.log('Heygen Avatar session stopped.'))
          .catch(e => console.error('Error stopping avatar session:', e));
        // Clean up event listeners
        Object.values(StreamingEvents).forEach(event_name => {
            if (typeof event_name === 'string') { // Enums can have reverse mappings
                 avatarRef.current.off(event_name, ()=>{}); // A general way to attempt removing listeners
            }
        });
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [sessionToken, avatarName, voiceId, initialMessage, sessionId]); // Added sessionId to re-run speak if it becomes available

  // Example function to make the avatar speak, can be triggered by props or internal UI
  // For now, it's not directly used but shows how to call speak
  const makeAvatarSpeak = (text) => {
    if (avatarRef.current && sessionId && text) {
      setDebugMessage(`Attempting to speak: "${text}"`);
      avatarRef.current.speak({
        sessionId: sessionId,
        text: text,
        taskType: TaskType.REPEAT, // Or TaskType.TALK
      })
      .then(() => setDebugMessage('Speak command sent.'))
      .catch(e => {
        setDebugMessage(`Error sending speak command: ${e.message}`);
        console.error('Error sending speak command:', e);
      });
    } else {
      setDebugMessage('Avatar not ready to speak or no text provided.');
      console.warn('Avatar not ready or no text for speak', {avatar: avatarRef.current, sessionId, text});
    }
  };

  return (
    <div className="heygen-avatar-container" style={{ width: '300px', height: '300px', backgroundColor: '#222' }}>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%' }} />
      <div style={{ color: 'white', fontSize: '12px', padding: '5px', position: 'absolute', bottom: '0', left: '0', width: '100%', backgroundColor: 'rgba(0,0,0,0.5)' }}>{debugMessage}</div>
      {/* Example button to test speak, you can remove this */}
      {/* <button onClick={() => makeAvatarSpeak("Hello from React!")} style={{marginTop: '10px'}}>Test Speak</button> */}
    </div>
  );
};

export default HeygenAvatar; 