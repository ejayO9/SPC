# Tavus Avatar Setup Guide

## Getting Started with Tavus

The avatar agent is currently failing because it needs valid Tavus replica and persona IDs. You have two options:

### Option 1: Run Voice-Only Mode (No Avatar)
If you don't have Tavus credentials yet, the agent will run in voice-only mode. You can still interact with the AI assistant through voice, but without the visual avatar.

### Option 2: Set Up Tavus (For Visual Avatar)

1. **Sign up for Tavus**
   - Go to [https://www.tavus.io/](https://www.tavus.io/)
   - Create an account and get API access

2. **Create a Replica**
   - In the Tavus dashboard, create a new replica (digital avatar)
   - Note down the `replica_id`

3. **Create a Persona**
   - Create a persona for your replica
   - Note down the `persona_id`

4. **Add to .env file**
   Add these to your `avatar-livekit/.env` file:
   ```
   TAVUS_API_KEY=your-tavus-api-key
   TAVUS_REPLICA_ID=your-replica-id
   TAVUS_PERSONA_ID=your-persona-id
   ```

## Running the Agent

### Voice-Only Mode (No Tavus setup required):
```bash
python pipeline.py connect --room avatar-room
```

### With Tavus Avatar:
After setting up your .env file with valid Tavus credentials:
```bash
python pipeline.py connect --room avatar-room
```

## Troubleshooting

1. **"Invalid replica_uuid" error**: Your replica ID is incorrect or doesn't exist in your Tavus account
2. **"Invalid persona_uuid" error**: Your persona ID is incorrect or doesn't exist
3. **Authentication error**: Your Tavus API key is invalid

## Alternative: Disable Avatar

If you want to run without any avatar functionality, you can comment out the avatar code in pipeline.py or just let it run in voice-only mode as configured above. 