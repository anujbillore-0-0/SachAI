import asyncio
import streamlit as st

# We need to import the core graph
from fact_checker.agent import graph

st.set_page_config(
    page_title="Fact Checker AI",
    page_icon="🔍",
    layout="wide",
)

st.title("Fact Checker AI")
st.markdown("Enter a statement or text below, and the AI will analyze and fact-check it.")

# Get user input
user_input = st.text_area("Enter text to fact-check:", height=200)

async def run_agent(text):
    """Run the LangGraph agent asynchronously."""
    inputs = {"answer": text}
    # This will run the entire graph and return the final state
    final_state = await graph.ainvoke(inputs)
    return final_state

if st.button("Fact-Check"):
    if not user_input.strip():
        st.warning("Please enter some text to analyze.")
    else:
        with st.spinner("Analyzing... This may take a moment."):
            try:
                # Use asyncio.run to run the async function
                final_state = asyncio.run(run_agent(user_input))
                
                # Retrieve the final report from the state
                final_report = final_state.get("final_report")

                if final_report:
                    st.success("Fact-Check Complete!")
                    
                    st.header("Overall Verdict")
                    st.write(final_report.summary)
                    
                    st.header("Individual Claims")
                    
                    for i, verdict in enumerate(final_report.verified_claims):
                        with st.expander(f"Claim {i+1}: {verdict.result} - {verdict.claim_text}"):
                            st.subheader("Reasoning")
                            st.write(verdict.reasoning)
                            
                            st.subheader("Sources")
                            if verdict.sources:
                                for source in verdict.sources:
                                    if source.is_influential:
                                        st.markdown(f"**🔗 {source.title or 'Source'}:** [{source.url}]({source.url})")
                                        st.markdown(f"**Snippet:** {source.text[:200]}...")
                                    else:
                                        st.markdown(f"**🔗 {source.title or 'Source'}:** [{source.url}]({source.url})")
                            else:
                                st.warning("No sources were found for this claim.")

                else:
                    st.error("Failed to generate a complete report. Please try again.")

            except Exception as e:
                st.error(f"An error occurred: {e}")
                st.info("Please make sure you have set up your API keys in the `.env` file.")