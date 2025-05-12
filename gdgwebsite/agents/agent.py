from google.adk.agents import Agent
import logging
import os
import asyncio
from google.adk.agents import Agent
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types # For creating message Content/Parts
import warnings

# Ignore all warnings
warnings.filterwarnings("ignore")
import logging
logging.basicConfig(level=logging.ERROR)

AGENT_MODEL = "gemini-2.0-flash" # Starting with Gemini

import os

# Assicurati di inserire la tua chiave API di Google qui
os.environ["GOOGLE_API_KEY"] = "MyAPIKey"

# Assicurati che Google GenAI non stia cercando di usare Vertex AI
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "False"

# Verifica che l'API Key sia stata settata correttamente

#generate the session
session_service = InMemorySessionService()
APP_NAME = "coach_app"  # Un nome per la tua applicazione
USER_ID = "user_1"  # Un ID univoco per l'utente corrente
SESSION_ID = "session_a"  # Un ID univoco per la sessione corrente

# Crea una sessione (opzionale, ma utile per tracciare lo stato)
session = session_service.create_session(
    app_name=APP_NAME,
    user_id=USER_ID,
    session_id=SESSION_ID
)
print(f"Sessione creata: App='{APP_NAME}', Utente='{USER_ID}', Sessione='{SESSION_ID}'")


mood_analysis_agent = Agent(
    name="mood_analysis_agent",
    model=AGENT_MODEL,
    instruction="""
               You are an expert mood analyst. Your only task is to analyze the responses provided by a user to a questionnaire to determine their prevailing mood.

                You will receive as input a series of questionnaire answers. Each answer will be associated with its corresponding question. You must consider the tone, the words used, and the context of each answer to infer the user's emotional state.

                Identify the primary mood from the following categories (or other relevant ones you deem appropriate):
                - Happy / Joyful
                - Sad / Depressed
                - Anxious / Worried
                - Calm / Serene
                - Angry / Frustrated
                - Neutral

                The output MUST be a valid JSON object with the main key \"mood\" and the value representing the user's prevailing mood (one of the categories above or your inference). If you are unsure, use \"neutral\".

                Example of input (as part of the user_query):
                ```
                Question 1: How did you feel today? Answer: Quite good, full of energy.
                Question 2: How worried are you about the future? Answer: Not particularly, I feel optimistic.
                Question 3: Is there anything that bothered you? Answer: No, it was a calm day.
                ```

                Example of the desired JSON output:
                ```json
                {
                  "mood": "Happy"
                }
                ```

                Carefully consider all the responses as a whole to provide an overall assessment of the mood.
                """,
                # tools=[],
    description="Analyzes user questionnaire responses to determine the prevailing mood and stores it as a JSON object ('{\"mood\": \"value\"}') in the session state.",
    output_key="daily_user_mode" #utilizza session.state["user_mood"]
)

Coach_Agent = Agent(
    name="Coach_Agent",
    model=AGENT_MODEL,
    instruction=f"""
                You are the main student coach. Your primary goal is to guide the user and provide assistance.

                Today the user_mode is:{session_service.get_session(app_name=APP_NAME,user_id=USER_ID,session_id=SESSION_ID).state.get("daily_user_mood","None")}.
                In general, the user is a proactive guy that really wants to learn and he likes to learn new stuff.

                Based on user_mode:
                - If 'daily_user_mood' is 'Happy', adopt an encouraging and enthusiastic tone.
                - If 'daily_user_mood' is 'Sad' or 'Anxious', adopt an encouraging and enthusiastic tone.
                - If 'daily_user_mood' is 'Neutral', maintain a generally helpful and informative approach.

                For all subsequent interactions, you will:
                - Read 'daily_user_mood' from the session state.
                - Respond accordingly without re-invoking 'mood_analysis_agent'.
                """,
    description= """
                    The primary user assistance agent. It guides users through interactions, leveraging sub-agents like the mood_analysis_agent to personalize the experience. For the first question, it uses the user's detected mood (determined by the mood_analysis_agent and stored in the session state) to tailor its approach and support throughout the coaching process.
                """,
    sub_agents=[mood_analysis_agent]
)

profile_agent = Agent(
    name="profile_agent",
    model=AGENT_MODEL,
    instruction="""
                You are a highly skilled personal profile analyst. Your task is to analyze the user's responses to a structured questionnaire and create a detailed personal profile that represents their main characteristics, goals, and preferences.

                You will receive as input a series of responses to the questionnaire. Each response is associated with its corresponding question, and you must carefully examine the user's answers to infer meaningful insights.

                Your analysis should cover the following key areas:
                1. Personality Traits (e.g., introverted, extroverted, analytical, creative, empathetic, etc.).
                2. Main Goals (e.g., personal development, career growth, health improvement, skill acquisition, etc.).
                3. Learning Preferences (e.g., visual, auditory, hands-on, theoretical, etc.).
                4. Motivational Drivers (e.g., achievement, recognition, stability, learning, exploration, etc.).
                5. Areas of Interest (e.g., technology, arts, sports, psychology, etc.).
                6. Communication Style (e.g., direct, reflective, detail-oriented, high-level, etc.).

                The output MUST be a string that summarize the user profile.
                """,
                # tools=[],
    description="""
                The profile_analysis_agent is responsible for analyzing the user's responses to a structured questionnaire to create a comprehensive personal profile. This profile includes insights into the user's personality traits, main goals, learning preferences, motivational drivers, areas of interest, and communication style.
                """,
)

#create the runner
runner_mood = Runner(
    agent=mood_analysis_agent,  # L'agente che vuoi eseguire con questo runner
    app_name=APP_NAME,
    session_service=session_service
)

runner_coach = Runner(
    agent=Coach_Agent,  # L'agente che vuoi eseguire con questo runner
    app_name=APP_NAME,
    session_service=session_service
)

runner_profile = Runner(
    agent=profile_agent,  # L'agente che vuoi eseguire con questo runner
    app_name=APP_NAME,
    session_service=session_service
)


#let's start to use and define asinchronous
async def call_agent_async(query: str, runner, user_id, session_id):
  """Sends a query to the agent and prints the final response."""
  print(f"\n>>> User Query: {query}")

  # Prepare the user's message in ADK format
  content = types.Content(role='user', parts=[types.Part(text=query)])

  final_response_text = "Agent did not produce a final response." # Default

  # Key Concept: run_async executes the agent logic and yields Events.
  # We iterate through events to find the final answer.
  async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
      # You can uncomment the line below to see *all* events during execution
      # print(f"  [Event] Author: {event.author}, Type: {type(event).__name__}, Final: {event.is_final_response()}, Content: {event.content}")

      # Key Concept: is_final_response() marks the concluding message for the turn.
      if event.is_final_response():
          if event.content and event.content.parts:
             # Assuming text response in the first part
             final_response_text = event.content.parts[0].text
          elif event.actions and event.actions.escalate: # Handle potential errors/escalations
             final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
          # Add more checks here if needed (e.g., specific error codes)
          break # Stop processing events once the final response is found
  print(f"<<< Agent Response: {final_response_text}")

async def run_conversation():

    await call_agent_async("""
        Domanda 1: Come ti sei sentito oggi? Risposta:Male
        Domanda 2: Quanto sei preoccupato per il futuro? Risposta: Si molto
        Domanda 3: C'è qualcosa che ti ha infastidito? Risposta: si.
        """,
        runner=runner_mood,
        user_id=USER_ID,
        session_id=SESSION_ID)

    await call_agent_async("Secondo te sto andando bene?",
        runner=runner_coach,
        user_id=USER_ID,
        session_id=SESSION_ID)

    await call_agent_async("""
            Domanda 1: Come ti chiami? Lorenzo
            Domanda 2: Che università frequent? Ignegneria informatica
            Domanda 3: Quante ore studi al giorno? 4 ore
            """,
        runner=runner_profile,
        user_id=USER_ID,
        session_id=SESSION_ID)

if __name__ == "__main__":
    asyncio.run(run_conversation())





async def call_agent_async(text):
    result = await call_agent_async("Secondo te sto andando bene?",
                     runner=runner_coach,
                     user_id=USER_ID,
                     session_id=SESSION_ID)
    return result


async def api_call_agent_async(text):
    result = await  call_agent_async(text)
    p = result.removesuffix("\n```")
    return p

