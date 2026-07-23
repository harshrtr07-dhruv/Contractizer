"""
Context-Aware Risk Scoring & Plain-English Explanation Engine
"""

# Base severity out of 10
CLAUSE_RISK_MAP = {
    "Uncapped Liability": 9.5,
    "Limitation of Liability": 6.5,
    "Auto-Renewal": 5.5,
    "Governing Law": 3.0,
    "Termination for Convenience": 4.5,
    "Non-Compete": 7.5,
    "Indemnification": 7.0,
    "Exclusivity": 6.0,
    "Audit Rights": 4.0,
    "Force Majeure": 2.5,
    "Warranty": 3.5,
    "Confidentiality": 3.0,
    "Liquidated Damages": 6.5,
    "Default": 3.0
}

# Plain English explanations
EXPLANATION_TEMPLATES = {
    "Limitation of Liability": "This clause limits financial liability in case of breach. It represents a {risk_category} risk.",
    "Uncapped Liability": "Exposes a party to unlimited financial liability. This is a {risk_category} risk because damages are not capped.",
    "Auto-Renewal": "This contract automatically renews unless canceled in advance. Represents a {risk_category} risk of unintentional renewal.",
    "Governing Law": "Specifies the governing legal jurisdiction. Poses a {risk_category} risk depending on jurisdiction neutrality.",
    "Termination for Convenience": "Allows cancellation without cause. Poses a {risk_category} risk to contract stability.",
    "Non-Compete": "Restricts competing business activities. Represents a {risk_category} risk to business flexibility.",
    "Indemnification": "Requires compensation for certain damages or losses. Represents a {risk_category} risk.",
    "Exclusivity": "Requires working exclusively with this party, representing a {risk_category} risk to commercial freedom.",
    "Audit Rights": "Allows auditing of internal records, posing a {risk_category} administrative risk.",
    "Force Majeure": "Excuses performance due to unforeseeable events. Standard commercial clause with {risk_category} risk.",
    "Warranty": "Promises product/service standards, posing a {risk_category} risk if disclaimed.",
    "Confidentiality": "Protects proprietary information. Standard terms pose a {risk_category} risk.",
    "Liquidated Damages": "Pre-determines damages for breach, representing a {risk_category} risk.",
    "Default": "Flagged for standard legal review, posing a {risk_category} risk."
}

def get_risk_category(score: float) -> str:
    if score >= 7.5:
        return "High"
    elif score >= 4.5:
        return "Medium"
    return "Low"

def get_clause_explanation(clause_type: str, confidence_score: float = 1.0, clause_text: str = "") -> dict:
    """
    Returns context-aware risk score and plain English explanation for a given clause.
    Detects mutual / reciprocal terms to prevent false positive high-risk scoring on standard NDAs.
    """
    lower = clause_text.lower()
    base_score = CLAUSE_RISK_MAP.get(clause_type, CLAUSE_RISK_MAP["Default"])

    # 1. Detect mutual / reciprocal / standard commercial terms
    is_mutual = any(word in lower for word in ["mutual", "reciprocal", "each party", "either party", "both parties", "standard"])
    is_capped = "shall not exceed" in lower or "total fees" in lower or "cap" in lower or "aggregate liability" in lower

    if clause_type == "Limitation of Liability":
        if "uncapped" in lower or "unlimited liability" in lower:
            base_score = 9.5
        elif is_mutual or is_capped:
            base_score = 3.2  # Standard mutual liability cap is LOW risk!
        else:
            base_score = 6.0
    elif clause_type == "Governing Law":
        base_score = 2.5 if is_mutual or any(loc in lower for loc in ["delaware", "new york", "california", "standard"]) else 3.5
    elif clause_type == "Confidentiality":
        base_score = 2.0 if is_mutual else 3.5
    elif clause_type == "Termination for Convenience":
        base_score = 3.2 if is_mutual else 5.5
    elif clause_type == "Force Majeure":
        base_score = 2.0
    elif clause_type == "Indemnification":
        base_score = 4.0 if is_mutual else 7.5

    final_score = base_score * (0.8 + 0.2 * confidence_score)
    final_score = max(1.0, min(10.0, final_score))
    category = get_risk_category(final_score)
    
    template = EXPLANATION_TEMPLATES.get(clause_type, EXPLANATION_TEMPLATES["Default"])
    explanation = template.format(risk_category=category.lower())
    
    if is_mutual:
        explanation += " Terms are reciprocal and protect both parties equally."

    return {
        "risk_score": round(final_score, 1),
        "risk_category": category,
        "plain_english": explanation
    }
