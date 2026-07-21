import os
import logging
from huggingface_hub import AsyncInferenceClient

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

HF_USERNAME = "harshrtr07"
MODEL_NAME = "legal-bert-cuad-risk-analyzer"

async def analyze_texts_with_hf(texts: list[str]) -> list[dict]:
    """
    Sends a batch of contract paragraphs to the Hugging Face Inference API 
    using the official huggingface_hub SDK.
    """
    hf_token = os.getenv("HUGGINGFACE_API_KEY")
    if not hf_token:
        logger.error("HUGGINGFACE_API_KEY is not set in the environment variables.")
        return [{"error": "API key missing"} for _ in texts]

    # Initialize the official async client
    client = AsyncInferenceClient(model=f"{HF_USERNAME}/{MODEL_NAME}", token=hf_token)
    
    predictions_list = []
    
    try:
        # The official SDK handles routing, headers, and retries automatically!
        # It's currently safer to query them one-by-one with the SDK
        for text in texts:
            # Skip very empty text
            if len(text.strip()) < 10:
                predictions_list.append({"clause_category": "Default", "confidence": 0.0})
                continue
                
            result = await client.text_classification(text)
            
            # The result is a list of ClassificationOutput objects sorted by score
            if result and len(result) > 0:
                top_prediction = result[0]
                predictions_list.append({
                    "clause_category": top_prediction.label,
                    "confidence": top_prediction.score
                })
            else:
                predictions_list.append({"clause_category": "Default", "confidence": 0.0})
                
        return predictions_list
        
    except Exception as e:
        logger.error(f"Failed to connect to Hugging Face API via SDK: {str(e)}")
        # Check if the error is a 503 (Model loading)
        if "503" in str(e):
            return [{"error": "Model is loading. Please try again in 30 seconds."} for _ in texts]
        
        # If the ISP is blocking Hugging Face, provide a graceful fallback so the UI can still be built
        # We only do this locally! In production, this will return an API Error properly.
        if os.getenv("USE_MOCK_FALLBACK") == "True":
            logger.warning("Using MOCK predictions because the Hugging Face API is blocked by your local network/ISP.")
            mock_predictions = []
            for i, text in enumerate(texts):
                # Deterministic mock based on text length to simulate variety
                if len(text) > 200:
                    mock_predictions.append({"clause_category": "Limitation of Liability", "confidence": 0.85})
                elif len(text) > 100:
                    mock_predictions.append({"clause_category": "Governing Law", "confidence": 0.92})
                else:
                    mock_predictions.append({"clause_category": "Default", "confidence": 0.45})
            return mock_predictions
        
        return [{"error": f"API Error: {str(e)}"} for _ in texts]
