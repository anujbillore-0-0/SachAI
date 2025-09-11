import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Import the main LangGraph agent from your project
from fact_checker.agent import graph
from fact_checker.schemas import FactCheckReport

# --- Pydantic Models for API ---
class FactCheckRequest(BaseModel):
    """Request model for the fact-checking endpoint."""
    text: str

# --- FastAPI Application ---
app = FastAPI(
    title="sachAI Fact-Checker API",
    description="An API to power the sachAI fact-checking agent.",
    version="1.0.0"
)

# --- CORS Configuration ---
# This is crucial to allow the browser extension to communicate with the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, you can restrict this for production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --- API Endpoints ---
@app.post("/fact-check", response_model=FactCheckReport)
async def fact_check_endpoint(request: FactCheckRequest):
    """
    Receives text, runs it through the LangGraph agent, and returns the report.
    """
    inputs = {"answer": request.text}
    
    # Run the entire graph and get the final state
    final_state = await graph.ainvoke(inputs)
    
    # Retrieve the final report from the state
    final_report = final_state.get("final_report")
    
    if final_report:
        return final_report
    else:
        # Fallback in case the report generation fails
        return {"error": "Failed to generate a complete report."}

# --- Main entry point to run the API server ---
if __name__ == "__main__":
    print("Starting sachAI FastAPI server...")
    print("API will be available at http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
