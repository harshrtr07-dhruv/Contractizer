"""
Deterministic Risk Scoring & Explanation Layer
This maps CUAD clause categories to risk scores and plain English explanations.
We use this deterministic approach rather than an LLM generation for reliability, speed, and cost.
"""

# Base severity out of 10
CLAUSE_RISK_MAP = {
    "Limitation of Liability": 9,
    "Uncapped Liability": 10,
    "Auto-Renewal": 7,
    "Governing Law": 4,
    "Termination for Convenience": 6,
    "Non-Compete": 8,
    "Indemnification": 8,
    "Exclusivity": 7,
    "Audit Rights": 5,
    "Force Majeure": 3,
    "Warranty": 5,
    "Confidentiality": 4,
    "Liquidated Damages": 7,
    "Default": 5
}

# Plain English explanations
EXPLANATION_TEMPLATES = {
    "Limitation of Liability": "This clause limits the amount of money a party can be sued for. It is a {risk_category} risk because it restricts financial recovery in the event of a breach.",
    "Uncapped Liability": "This clause exposes a party to unlimited financial liability. This is a {risk_category} risk because damages are not capped.",
    "Auto-Renewal": "This contract automatically renews unless canceled in advance. This is a {risk_category} risk as you may be locked into another term unintentionally.",
    "Governing Law": "This determines which state or country's laws govern the contract. It poses a {risk_category} risk depending on how favorable the jurisdiction is.",
    "Termination for Convenience": "Allows one or both parties to cancel the contract at any time without cause. This creates a {risk_category} risk of sudden contract cancellation.",
    "Non-Compete": "Restricts your ability to engage in competing business activities. This is a {risk_category} risk to future business flexibility.",
    "Indemnification": "Requires one party to compensate the other for certain damages or losses. High risk due to potential significant financial exposure.",
    "Exclusivity": "Requires you to work exclusively with this party. This restricts business opportunities, posing a {risk_category} risk.",
    "Audit Rights": "Allows the other party to audit your records. This is a {risk_category} risk due to administrative burden and exposure of internal data.",
    "Force Majeure": "Excuses performance due to unforeseeable circumstances (acts of God). Standard, but represents a {risk_category} risk if too broad or narrow.",
    "Warranty": "Promises that a product or service will meet certain standards. A {risk_category} risk if the warranty is waived or disclaimed heavily.",
    "Confidentiality": "Prevents disclosure of sensitive information. Poses a {risk_category} risk if the terms are one-sided or overly restrictive.",
    "Liquidated Damages": "Pre-determines the amount of money paid if a breach occurs. A {risk_category} risk if the amount is unreasonably high.",
    "Default": "This clause has been flagged for review. This represents a {risk_category} risk based on standard commercial standards."
}

def get_risk_category(score: float) -> str:
    if score >= 8:
        return "High"
    elif score >= 5:
        return "Medium"
    return "Low"

def get_clause_explanation(clause_type: str, confidence_score: float = 1.0) -> dict:
    """
    Returns the computed risk score and explanation for a given clause type.
    """
    base_score = CLAUSE_RISK_MAP.get(clause_type, CLAUSE_RISK_MAP["Default"])
    
    # Adjust score based on model confidence (e.g. low confidence scales down severity slightly)
    final_score = base_score * confidence_score
    # Cap between 1 and 10
    final_score = max(1.0, min(10.0, final_score))
    
    category = get_risk_category(final_score)
    template = EXPLANATION_TEMPLATES.get(clause_type, EXPLANATION_TEMPLATES["Default"])
    
    explanation = template.format(risk_category=category.lower())
    
    return {
        "risk_score": round(final_score, 1),
        "risk_category": category,
        "plain_english": explanation
    }
