import os
import json
import logging
import re
import openai
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

# -----------------------------------
# Setup Logging and OpenAI
# -----------------------------------
logger = logging.getLogger(__name__)
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)
openai.api_key = "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"

# -----------------------------------
# Helper Functions
# -----------------------------------

def call_gpt(prompt: str, max_tokens: int = 1500, temperature: float = 0.3) -> str:
    logger.info("Sending prompt to OpenAI: %s", prompt[:100].replace("\n", " "))
    try:
        # Using openai-python v1 API with timeout
        response = openai.chat.completions.create(
            model="gpt-4o-mini",  # Using faster model
            messages=[
                {"role": "system", "content": "You are a startup valuation expert. Be concise but thorough."},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            max_tokens=max_tokens,
            timeout=30  # 30 second timeout
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


def safe_parse_json(text: str) -> dict:
    import json
    import re

    logger.info(f"Parsing response: {text[:200]}...")
    
    # Try to extract JSON from a ```json ... ``` code block first
    codeblock_match = re.search(r"```json[\s\n]*([\s\S]+?)```", text)
    if codeblock_match:
        json_str = codeblock_match.group(1).strip()
    else:
        # Fallback: extract the first {...} block (greedy to get complete JSON)
        match = re.search(r"({[\s\S]+})", text)
        if match:
            json_str = match.group(1).strip()
        else:
            logger.error("No JSON object found in response. Full text: %s", text)
            return {"error": "No JSON object found in GPT response", "raw": text}

    # Clean up common JSON issues
    json_str = re.sub(r",\s*([}\]])", r"\1", json_str)  # Remove trailing commas
    json_str = re.sub(r'([{,]\s*)"([^"]+)"\s*:\s*"([^"]*)"([^,}\]]*)', r'\1"\2": "\3"', json_str)  # Fix unescaped quotes
    
    # Try to fix incomplete JSON by adding missing closing braces
    open_braces = json_str.count('{')
    close_braces = json_str.count('}')
    if open_braces > close_braces:
        json_str += '}' * (open_braces - close_braces)
    
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        logger.error("JSON parse error. Extracted: %s, Error: %s", json_str, str(e))
        # Try to create a minimal valid response
        return {
            "error": "Incomplete response from AI", 
            "raw": text,
            "partial_json": json_str
        }

# -----------------------------------
# Stage Implementations
# -----------------------------------

def stage1(data: dict) -> dict:
    prompt = f"""Analyze this startup data and respond in JSON format only:

Data: {json.dumps(data, indent=2)}

Required JSON fields:
- summary: 2-3 sentence business overview
- stageAssessment: "Early", "Growth", or "Mature" 
- keyStrengths: array of 3-4 main strengths
- weaknessesOrRisks: array of 2-3 key risks"""
    result = safe_parse_json(call_gpt(prompt, max_tokens=800))
    # Ensure recommendations is always a list
    if "recommendations" in result:
        rec = result["recommendations"]
        if isinstance(rec, str):
            # Split by newlines or semicolons if string
            result["recommendations"] = [r.strip() for r in re.split(r"[\n;]", rec) if r.strip()]
        elif not isinstance(rec, list):
            result["recommendations"] = [rec]
    return result


def stage2(summary: str) -> dict:
    prompt = f"""Based on this startup summary, recommend 3 valuation methods in JSON format:

Summary: {summary}

JSON format: {{"recommendedMethods": [{{"method": "name", "confidence": 0.8, "reason": "brief reason"}}]}}"""
    return safe_parse_json(call_gpt(prompt, max_tokens=600))


def stage3(method: dict, data: dict) -> dict:
    name = method.get("method", "")
    prompt = f"""Value startup using {name} method. Provide complete JSON response.

Data: {json.dumps(data, indent=1)}

Return ONLY this JSON structure (replace X,Y with numbers):
{{
  "method": "{name}",
  "valuationRange": {{"lower": X, "upper": Y}},
  "explanation": "brief rationale",
  "calculation": "key steps and assumptions",
  "narrative": "1-2 sentences"
}}"""
    return safe_parse_json(call_gpt(prompt, max_tokens=1500))


def stage4(summary: str) -> dict:
    prompt = f"""Find 3 competitors for this startup. Summary: {summary}

JSON format: {{"competitors": ["name1", "name2", "name3"], "competitorBenchmarks": [{{"name": "competitor", "valuation": "range", "difference": "key diff"}}], "commentary": "brief market position"}}"""
    return safe_parse_json(call_gpt(prompt, max_tokens=700))


def stage5(summary: str, calcs: list, comp: dict) -> str:
    prompt = f"""Write 2 paragraphs of strategic valuation context for investors.

Summary: {summary}
Calculations: {json.dumps(calcs, indent=1)}
Competitors: {json.dumps(comp, indent=1)}

Plain text only, investor tone."""
    return call_gpt(prompt, max_tokens=600)


def stage6(calcs: list) -> dict:
    ranges = [f"{c.get('method')}: ${c.get('valuationRange', {}).get('lower')}M–${c.get('valuationRange', {}).get('upper')}M" for c in calcs]
    prompt = f"""Summarize valuation ranges and provide final range. Ranges: {ranges}

JSON format: {{"finalRange": {{"lower": X, "upper": Y}}, "methodComparisons": "brief comparison", "justification": "rationale", "recommendations": "key advice"}}"""
    return safe_parse_json(call_gpt(prompt, max_tokens=600))

# -----------------------------------
# FastAPI Orchestrator
# -----------------------------------
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/valuation-report")
def generate_report(payload: dict = Body(...)):
    # Stage 1
    s1 = stage1(payload)
    if 'error' in s1:
        raise HTTPException(status_code=500, detail=s1)
    # Stage 2
    s2 = stage2(s1['summary'])
    if 'error' in s2:
        raise HTTPException(status_code=500, detail=s2)
    # Stage 3
    calcs = []
    for method in s2.get('recommendedMethods', []):
        c = stage3(method, payload)
        if 'error' in c:
            raise HTTPException(status_code=500, detail=c)
        calcs.append(c)
    # Stage 4
    comp = stage4(s1['summary'])
    if 'error' in comp:
        raise HTTPException(status_code=500, detail=comp)
    # Stage 5
    strat = stage5(s1['summary'], calcs, comp)
    # Stage 6
    final = stage6(calcs)
    if 'error' in final:
        raise HTTPException(status_code=500, detail=final)

    # Ensure recommendations is always a list
    if "recommendations" in final:
        rec = final["recommendations"]
        if isinstance(rec, str):
            final["recommendations"] = [r.strip() for r in re.split(r"[\n;]", rec) if r.strip()]
        elif not isinstance(rec, list):
            final["recommendations"] = [rec]

    return {
        "businessSummary": s1,
        "recommendedMethods": s2,
        "calculations": calcs,
        "competitorAnalysis": comp,
        "strategicContext": strat,
        "finalValuation": final
    }

@app.post("/valuation-report-stream")
def generate_report_stream(payload: dict = Body(...)):
    def report_generator():
        try:
            # Stage 1
            yield json.dumps({"stage": 1, "status": "starting", "message": "Analyzing business fundamentals..."}) + "\n"
            s1 = stage1(payload)
            if 'error' in s1:
                yield json.dumps({"stage": 1, "error": s1}) + "\n"
                return
            yield json.dumps({"stage": 1, "businessSummary": s1}) + "\n"
            
            # Stage 2
            yield json.dumps({"stage": 2, "status": "starting", "message": "Selecting valuation methods..."}) + "\n"
            s2 = stage2(s1['summary'])
            if 'error' in s2:
                yield json.dumps({"stage": 2, "error": s2}) + "\n"
                return
            yield json.dumps({"stage": 2, "recommendedMethods": s2}) + "\n"
            
            # Stage 3
            calcs = []
            for i, method in enumerate(s2.get('recommendedMethods', [])):
                yield json.dumps({"stage": 3, "status": "starting", "message": f"Calculating valuation using {method.get('method', 'method')} ({i+1}/{len(s2.get('recommendedMethods', []))})"}) + "\n"
                c = stage3(method, payload)
                if 'error' in c:
                    yield json.dumps({"stage": 3, "error": c}) + "\n"
                    return
                calcs.append(c)
                yield json.dumps({"stage": 3, "calculation": c}) + "\n"
            
            # Stage 4
            yield json.dumps({"stage": 4, "status": "starting", "message": "Analyzing competitors..."}) + "\n"
            comp = stage4(s1['summary'])
            if 'error' in comp:
                yield json.dumps({"stage": 4, "error": comp}) + "\n"
                return
            yield json.dumps({"stage": 4, "competitorAnalysis": comp}) + "\n"
            
            # Stage 5
            yield json.dumps({"stage": 5, "status": "starting", "message": "Generating strategic context..."}) + "\n"
            strat = stage5(s1['summary'], calcs, comp)
            yield json.dumps({"stage": 5, "strategicContext": strat}) + "\n"
            
            # Stage 6
            yield json.dumps({"stage": 6, "status": "starting", "message": "Finalizing valuation..."}) + "\n"
            final = stage6(calcs)
            if 'error' in final:
                yield json.dumps({"stage": 6, "error": final}) + "\n"
                return
            yield json.dumps({"stage": 6, "finalValuation": final}) + "\n"
            
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield json.dumps({"error": str(e), "message": "Analysis failed. Please try again."}) + "\n"

    return StreamingResponse(report_generator(), media_type="application/json")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)