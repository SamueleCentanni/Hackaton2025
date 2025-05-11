#!/usr/bin/env python
# coding: utf-8

import os
import asyncio
from google.adk.agents import Agent
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types  # for creating message Content/Part
import warnings
from google.adk.tools import google_search
import json

# Assicurati di inserire la tua chiave API di Google qui
os.environ["GOOGLE_API_KEY"] = "AIzaSyBS2fPKnQ7XZmz9MIVkRH-nBAgoed0znR8"  # <--- Inserisci la tua chiave API qui

# Assicurati che Google GenAI non stia cercando di usare Vertex AI
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "False"

warnings.filterwarnings("ignore")

import logging

logging.basicConfig(level=logging.ERROR)

AGENT_MODEL = "gemini-2.0-flash"

# constants for identifying the interaction context
APP_NAME = "403_Forbidden"

USER_ID = "admin"
SESSION_ID = "admin_session"

# Creating session
session_service = InMemorySessionService()

# specific section where the conversation will happen
session = session_service.create_session(
    app_name=APP_NAME,
    user_id=USER_ID,
    session_id=SESSION_ID
)

# Agents
clustering_agent = Agent(
    name="clustering_agent",
    model=AGENT_MODEL,  # Can be a string for Gemini or a LiteLlm object
    description="""
        A sub-agent responsible for analyzing long text strings (documents) to identify the main topics discussed. 
        The agent organizes the topics clearly, allowing for better understanding and classification of the content.
    """,
    instruction="""
        You are an expert document analyst. Your task is to carefully read a long text string representing a document. 
        After understanding the content, you must identify the main topics discussed in the document.

        The output must follow the JSON format. Each main topic should be identified by a unique "id" (representing the theme), 
        a "name" that briefly describes the topic, and a "val" that indicates the cost of the path 
        (a numerical value indicating the importance or relevance of the topic, such as a score).

        The output JSON should have a valid structure, with micro-titles as keys and their corresponding brief explanations as values. 
        DO NOT include any introductory or concluding text outside of the JSON structure.
        

        Example of the REQUIRED JSON format:
        {
    "nodes": [
        {
            "id": "root",
            "name": "Root node",
            "val": 1
        },
        {
            "id": "Big Data Definition and Characteristics",
            "name": "Defines Big Data as large, complex datasets unmanageable by traditional tools, highlighting the 3Vs: Volume, Velocity, and Variety.",
            "val": 1
        },
        {
            "id": "Data Management Pipeline",
            "name": "Outlines the steps in data management: Acquisition, Cleaning & Extraction, Aggregation & Representation, Modeling, and Interpretation.",
            "val": 1
        },
        {
            "id": "Additional Data Management Aspects",
            "name": "Discusses Heterogeneity, Privacy concerns, and the importance of clear data visualization in dataset management.",
            "val": 1
        },
        {
            "id": "Data Science Definition and Goal",
            "name": "Defines Data Science as data analysis with the primary goal of generating profit.",
            "val": 1
        },
        {
            "id": "Responsibilities of Data Scientists",
            "name": "Lists the tasks of data scientists, including customer behavior analysis, code quality verification, domain-specific problem-solving, and dataset preparation.",
            "val": 1
        }
    ],
    "links": [
        {
            "source": "root",
            "target": "Big Data Definition and Characteristics"
        },
        {
            "source": "root",
            "target": "Data Management Pipeline"
        },
        {
            "source": "root",
            "target": "Additional Data Management Aspects"
        },
        {
            "source": "root",
            "target": "Data Science Definition and Goal"
        },
        {
            "source": "root",
            "target": "Responsibilities of Data Scientists"
        }
    ]
}
    """
)

quiz_agent = Agent(
    name="quiz_agent",
    model=AGENT_MODEL,  # Can be a string for Gemini or a LiteLlm object
    description="""
        An expert quiz designer responsible for generating quiz questions from educational or technical documents.
        This agent reads a long text input, identifies key concepts, and generates a structured set of quiz questions,
        including both multiple-choice and open-ended types. Each question must reference the specific part of the input text 
        it was derived from.
    """,
    instruction="""
        You are a highly specialized quiz generation agent. You must read the full input text and produce a quiz in JSON format only. 
        Do NOT include any explanations, introductory text, or commentary outside the JSON structure.

        Your output must be a valid JSON array. Each item in the array represents a quiz question and must contain the following keys:

        - "question": The text of the question.
        - "options": A list of exactly 5 answer options 
        - "answer": The correct answer.
        - "source": The exact sentence or short paragraph from the input text that was used to generate the question.

        Formatting rules (MANDATORY):
        - The JSON output MUST be syntactically valid.
        - The "options" and "answer" field MUST be omitted for open questions.
        - You MUST generate 5 questions, with only response valid.
        
        

        Example of the REQUIRED JSON structure:
        ```json
        [
          {
            "question": "What is the main advantage of supervised learning?",
            "options": ["It does not need labeled data", "It uses reinforcement signals", "It relies on labeled data to train", "It generates images from noise"],
            "answer": "It relies on labeled data to train",
            "source": "Supervised learning is a type of machine learning that relies on labeled data to train a model."
          }
        ]
        ```

        IT'S MANDATORY TO PROVIDE A VALID JSON STRING NOT IN A CODE BOX, ONLY THE JSON ELEMENTS
        
        DO NOT invent facts or questions. Use only the provided text. Every question must clearly reflect actual 
        content from the input and MUST include the corresponding "source" text to prove its validity.
    """
)

googleSearch_agent = Agent(
    name="googleSearch_agent",
    model=AGENT_MODEL,  # Can be a string for Gemini or a LiteLlm object
    description="""
        An expert resource recommender that helps students deepen their understanding by suggesting relevant external resources (videos, articles, tutorials).
    """,
    instruction="""
        Given an input text and key learning points from a document, suggest a list of relevant YouTube search queries and article topics. 

        Your output MUST be in valid JSON format. Each element should follow this structure:
        [
          {
            "topic": "Gradient Descent",
            "youtube_query": "Gradient descent explained visually",
            "article_query": "Introduction to gradient descent"
          },
          ...
        ]

        Guidelines:
        - You MUST NOT provide actual links.
        - You MUST NOT invent topics or hallucinate content.
        - You MUST generate realistic and helpful search queries based solely on the input text.
        - If unsure or the input text lacks meaningful content, reply with: "I do not know."
    """,
    tools=[google_search]
)

# ---- Runner ---
# orchestrates the agent execution loop
runner_clust = Runner(
    agent=clustering_agent,
    app_name=APP_NAME,
    session_service=session_service
)
runner_quiz = Runner(
    agent=quiz_agent,
    app_name=APP_NAME,
    session_service=session_service
)
runner_search = Runner(
    agent=googleSearch_agent,
    app_name=APP_NAME,
    session_service=session_service
)


async def call_agent_async(query: str, runner, user_id, session_id):
    """Sends a query to the agent and prints the final response."""
    # print(f"\n>>> User Query: {query}")

    # Prepare the user's message in ADK format
    content = types.Content(role='user', parts=[types.Part(text=query)])

    final_response_text = "Agent did not produce a final response."  # Default

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
                return final_response_text
            elif event.actions and event.actions.escalate:  # Handle potential errors/escalations
                final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
                return final_response_text
            break
    # print(f"<<< Agent Response: {final_response_text}")


async def quiz_generator(text):
    result = await call_agent_async(query=text,
                           runner=runner_quiz,
                           user_id=USER_ID,
                           session_id=SESSION_ID)
    return result

async def api_quiz_generator(text):
    result = await  quiz_generator(text)
    p = result.removesuffix("\n```")
    return p




async def reference_generator(text):
    result = await call_agent_async(query=text,
                           runner=runner_search,
                           user_id=USER_ID,
                           session_id=SESSION_ID)
    return result

async def api_reference_generator(text):
    result = await  reference_generator(text)
    p = result.removesuffix("\n```")
    return p






async def topics_generator(text):
    result = await call_agent_async(query=text,
                           runner=runner_clust,
                           user_id=USER_ID,
                           session_id=SESSION_ID)
    return result

async def api_topics_generator(text):
    result = await  topics_generator(text)
    p = result.removesuffix("\n```")
    return p
