import requests

url = "https://tavusapi.com/v2/personas"

payload = {
    "persona_name": "test3",
    # "system_prompt": "As a Life Coach, you are a dedicated professional who specializes in...",
    "pipeline_mode": "echo",
    # "context": "Here are a few times that you have helped an individual make a breakthrough in...",
    "default_replica_id": "r79e1c033f",
    "layers": {
        "transport": {
            "transport_type": "livekit"
        },
        # "llm": {
        #     "model": "<string>",
        #     "base_url": "your-base-url",
        #     "api_key": "your-api-key",
        #     "tools": [
        #         {
        #             "type": "function",
        #             "function": {
        #                 "name": "get_current_weather",
        #                 "description": "Get the current weather in a given location",
        #                 "parameters": {
        #                     "type": "object",
        #                     "properties": {
        #                         "location": {
        #                             "type": "string",
        #                             "description": "The city and state, e.g. San Francisco, CA"
        #                         },
        #                         "unit": {
        #                             "type": "string",
        #                             "enum": ["celsius", "fahrenheit"]
        #                         }
        #                     },
        #                     "required": ["location"]
        #                 }
        #             }
        #         }
        #     ],
        #     "headers": {"Authorization": "Bearer your-api-key"},
        #     "extra_body": {"temperature": 0.5}
        # },
        # "tts": {
        #     "api_key": "your-api-key",
        #     "tts_engine": "cartesia",
        #     "external_voice_id": "external-voice-id",
        #     "voice_settings": {
        #         "speed": "normal",
        #         "emotion": ["positivity:high", "curiosity"]
        #     },
        #     "playht_user_id": "your-playht-user-id",
        #     "tts_emotion_control": "false",
        #     "tts_model_name": "sonic"
        # },
        # "perception": {
        #     "perception_model": "raven-0",
        #     "ambient_awareness_queries": ["Is the user showing an ID card?", "Does the user appear distressed or uncomfortable?"],
        #     "perception_tool_prompt": "You have a tool to notify the system when an ID card is detected, named `notify_if_id_shown`. You MUST use this tool when a form of ID is detected.",
        #     "perception_tools": [
        #         {
        #             "type": "function",
        #             "function": {
        #                 "name": "notify_if_id_shown",
        #                 "description": "Use this function when a drivers license or passport is detected in the image with high confidence. After collecting the ID, internally use final_ask()",
        #                 "parameters": {
        #                     "type": "object",
        #                     "properties": {"id_type": {
        #                             "type": "string",
        #                             "description": "best guess on what type of ID it is"
        #                         }},
        #                     "required": ["id_type"]
        #                 }
        #             }
        #         }
        #     ]
        # },
        # "stt": {
        #     "stt_engine": "tavus-turbo",
        #     "participant_pause_sensitivity": "high",
        #     "participant_interrupt_sensitivity": "high",
        #     "hotwords": "Roey is the name of the person you're speaking with.",
        #     "smart_turn_detection": True
        # }
    }
}
headers = {
    "x-api-key": "bd1ba58aab254f31b4a2d028c5a4babe",
    "Content-Type": "application/json"
}

response = requests.request("POST", url, json=payload, headers=headers)

print(response.text)