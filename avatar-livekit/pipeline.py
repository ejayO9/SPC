from dotenv import load_dotenv
import os

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    openai,
    cartesia,
    deepgram,
    noise_cancellation,
    silero,
    tavus,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv()

tavus_api_key = ["aa397fc44131439fba2eef17ea0b4851"]

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions='''
                         You are a helpful voice AI assistant.
                         You are currently in a livekit room with a user.
                         You are able to see the user's video and hear their voice.
                         You are also able to see the room's text chat.
                         
                         ''')


async def entrypoint(ctx: agents.JobContext):
    # session = AgentSession(
    #     stt=deepgram.STT(model="nova-3", language="multi"),
    #     llm=openai.LLM(model="gpt-4o-mini"),
    #     tts=cartesia.TTS(),
    #     vad=silero.VAD.load(),
    #     turn_detection=MultilingualModel(),
    # )
    
    session = AgentSession(
        llm=openai.realtime.RealtimeModel(voice="alloy"),
    )
    
    # Connect to the room first
    await ctx.connect()
    
    avatar = tavus.AvatarSession(
        api_key=tavus_api_key[0],
        replica_id="r79e1c033f",  # ID of the Tavus replica to use
        persona_id="p902fda963fa",  # ID of the Tavus persona to use (see preceding section for configuration details)
    )
    
    # Start the avatar and wait for it to join
    await avatar.start(session, room=ctx.room)

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            # LiveKit Cloud enhanced noise cancellation
            # - If self-hosting, omit this parameter
            # - For telephony applications, use `BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVC(), 
            audio_enabled=True,
        ),
    )

    await session.generate_reply(
        instructions="Greet the user and offer your assistance."
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))