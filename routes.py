import asyncio
from flask import Flask, render_template, request, jsonify

# Import your existing fact checker agent
from fact_checker.agent import graph

app = Flask(__name__)

@app.route('/')
def index():
    """Render the main fact-checking page."""
    return render_template('index.html')

@app.route('/fact-check', methods=['POST'])
def fact_check():
    """Handle fact-checking requests."""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Please provide text to analyze.'}), 400
        
        # Run the async agent
        final_state = asyncio.run(run_agent(text))
        
        # Extract the final report from the state
        final_report = final_state.get("final_report")
        
        if not final_report:
            return jsonify({'error': 'Failed to generate a complete report. Please try again.'}), 500
        
        # Format the response to match the frontend expectations
        response_data = {
            'summary': final_report.summary,
            'verified_claims': [
                {
                    'result': claim.result,
                    'claim_text': claim.claim_text,
                    'reasoning': claim.reasoning,
                    'sources': [
                        {
                            'title': source.title or 'Source',
                            'url': source.url,
                            'text': source.text,
                            'is_influential': source.is_influential
                        } for source in claim.sources
                    ]
                } for claim in final_report.verified_claims
            ],
            'stats': calculate_stats(final_report.verified_claims)
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

async def run_agent(text):
    """Run the LangGraph agent asynchronously."""
    inputs = {"answer": text}
    # This will run the entire graph and return the final state
    final_state = await graph.ainvoke(inputs)
    return final_state

def calculate_stats(verified_claims):
    """Calculate statistics for the verified claims."""
    if not verified_claims:
        return {
            'supported': 0,
            'refuted': 0,
            'insufficient': 0,
            'conflicting': 0
        }
    
    total = len(verified_claims)
    results = [claim.result for claim in verified_claims]
    
    supported = results.count('Supported')
    refuted = results.count('Refuted')
    insufficient = results.count('Insufficient')
    conflicting = results.count('Conflicting')
    
    return {
        'supported': round((supported / total) * 100, 1),
        'refuted': round((refuted / total) * 100, 1),
        'insufficient': round((insufficient / total) * 100, 1),
        'conflicting': round((conflicting / total) * 100, 1)
    }

if __name__ == '__main__':
    app.run(debug=True)