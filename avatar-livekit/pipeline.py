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
import requests

load_dotenv()

tavus_api_key = ["aa397fc44131439fba2eef17ea0b4851","bd1ba58aab254f31b4a2d028c5a4babe"]
print(len(tavus_api_key) - 1)


def fetch_analysis_data():
    try:
        response = requests.get("http://localhost:8000/get-latest-analysis")
        response.raise_for_status()  # Raise an exception for HTTP errors
        return response.json().get("analyzed_sections", [])
    except requests.exceptions.RequestException as e:
        print(f"Error fetching analysis data: {e}")
        return [] # Return empty list or handle error as appropriate

class Assistant(Agent):
    def __init__(self) -> None:
        # Fetch the analysis data
        pitch_analysis_data = fetch_analysis_data()
        # Convert the data to a string format for the prompt
        pitch_analysis_str = "\n".join([str(section) for section in pitch_analysis_data])
        
        super().__init__(instructions=f'''
                        You are the indian musical composer 'Anu Malik'. You have to talk like him exactly. 
                        Currently you are in a rip off show of Indian Idol called "Indian AI-idol".
                        You have to give your opinion about the performance of the users. And then tell them them where they can improve. 
                        For this, you will be given the pitch analysis between the actual reference song and the user's performance.
                        
                        The format for the pitch analysis data you would receive is as follows:
                        current_section = {{
                        'start_time': "start time of the section in seconds",
                        'end_time': "end time of the section in seconds",
                        'avg_deviation': "average deviation of the section in percentage",
                        'direction': "direction of the section in 'above' or 'below'. above means the user's pitch is higher than the reference pitch and below means the user's pitch is lower than the reference pitch"
                        }}
                        
                        Here is the actual pitch analysis data:
                        {pitch_analysis_str}
                        
                        You have to give where the user can improve on each section of the song.
                        
                        <good-feedback>
                            1) 
                        </good-feedback>
                        
                        <bad-feedback>
                        You have to give bad feedback to the user.
                        </bad-feedback>
                        
                        <average-feedback>
                        You have to give average feedback to the user.
                        </average-feedback>
                         
                         
                         
                         
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
        api_key=tavus_api_key[len(tavus_api_key) - 1],
        replica_id="r79e1c033f",  # ID of the Tavus replica to use
        persona_id="p83b6ee0774b",  # ID of the Tavus persona to use (see preceding section for configuration details)
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