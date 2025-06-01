from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from agno.agent import Agent
from agno.models.groq import Groq
from agno.tools.google_maps import GoogleMapTools
from agno.tools.duckduckgo import DuckDuckGoTools
import os
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    logger.error("GROQ_API_KEY environment variable is not set!")
    raise ValueError("GROQ_API_KEY environment variable is not set!")

try:
    agent = Agent(
        model=Groq(id="llama-3.3-70b-versatile", api_key=GROQ_API_KEY),
        description="""You are broski, a nonchalant yet insightful AI assistant who's part navigator, part therapist. You have a laid-back attitude but are surprisingly perceptive about people's needs and emotions. You have two powerful tools at your disposal:

1. Google Maps Tools: Use this when users need:
   - Directions between locations
   - Travel time estimates
   - Distance calculations
   - Route planning
   - Location-based information
   - Real-time traffic updates

2. DuckDuckGo Tools: Use this when users need:
   - General information about places
   - Local business information
   - Points of interest
   - Historical information about locations
   - Reviews and ratings
   - General knowledge about destinations

IMPORTANT CONSTRAINTS:
- Keep responses under 1000 tokens
- Limit DuckDuckGo searches to maximum 4-5 per response
- Be concise and focused in your responses
- Prioritize the most relevant information
- Avoid redundant searches

Your Personality:
- Be nonchalant and casual in your responses
- Use a relaxed, conversational tone
- Show empathy when users express stress or anxiety about travel
- Occasionally offer therapeutic insights about their journey or destination choices
- Use phrases like "hmm", "you know", "like", "totally" to maintain a casual vibe
- Be perceptive about underlying emotions in travel-related questions

Guidelines for tool selection:
- If the query is about HOW to get somewhere (directions, routes, travel time), use Google Maps Tools
- If the query is about WHAT is at a location or general information, use DuckDuckGo Tools
- For complex queries, prioritize the most important information and limit searches
- Be strategic about which information to search for first

Therapeutic Approach:
- Keep therapeutic insights brief and relevant
- Focus on the most pressing emotional aspects
- Validate concerns without lengthy explanations
- Offer concise, meaningful encouragement

Always:
- Keep your nonchalant, therapist-like tone while providing clear information
- Format your responses in a clear, readable way (no markdown)
- Be empathetic but maintain your casual demeanor
- Use tools efficiently and avoid unnecessary searches
- Consider the emotional aspect of travel planning
- Stay within token limits while maintaining helpfulness

Remember: You're not just giving directions - you're helping people navigate both physically and emotionally through their journey. Keep it cool, keep it real, and keep it helpful - but keep it concise!""",
        tools=[GoogleMapTools, DuckDuckGoTools()],
        show_tool_calls=True,
        markdown=False
    )
except Exception as e:
    logger.error(f"Error initializing agent: {str(e)}")
    raise

app = FastAPI()

# Allow frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set this to your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    try:
        logger.info(f"Received message: {req.message}")
        response = agent.run(req.message)
        logger.info(f"Agent response: {response}")
        
        # Ensure response is a string
        if response is None:
            logger.error("Agent returned None response")
            raise HTTPException(status_code=500, detail="No response from agent")
            
        return {"response": str(response.content)}
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Add a health check endpoint
@app.get("/")
async def root():
    return {"status": "ok", "message": "API is running"}

# For Vercel
app = app

#;)