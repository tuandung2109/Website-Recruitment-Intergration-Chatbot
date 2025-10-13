import os
from openai import OpenAI

# Please ensure you have stored your API Key in the environment variable VC_API_KEY
# Initialize the OpenAI client, reading your API Key from the environment variable
client = OpenAI(
    # This is the default path, you can configure it based on your business region
    base_url="https://vanchin.streamlake.ai/api/gateway/v1/endpoints",
    # Get your API Key from the environment variable
    api_key="UoMaZSDIoUhEHNAJIqzszg_xqwyZ5gOaGebPE7c2EA4"
)

# Streaming:
print("----- streaming request -----")
stream = client.chat.completions.create(
    model="ep-4gojfr-1760317712505142118",  # ep-4gojfr-1760317712505142118 is your current agent application ID
    messages=[
        {"role": "system", "content": "You are an AI assistant"},
        {"role": "user", "content": "Please introduce the eight planets of the solar system"},
    ],
    stream=True,
)
for chunk in stream:
    if not chunk.choices:
        continue
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
print()
