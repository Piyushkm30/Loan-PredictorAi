"""
Bank Intelligence & Recommendation Engine for LoanPredict AI
Evaluates applicant profile against real-world bank underwriting criteria,
computes dynamic interest rates, monthly EMIs, eligibility status, and 
recommends 5–6 top matched/alternative banking partners.
"""

import math

BANKS = [
    {
        "id": "sbi",
        "name": "State Bank of India (SBI)",
        "short_name": "SBI",
        "type": "Public Sector",
        "icon": "🏛️",
        "badge_class": "badge-sbi",
        "tag": "Lowest Interest Rate",
        "base_rate": 8.40,
        "min_income": 20000,
        "requires_credit": True,
        "income_multiplier": 65,
        "processing_fee_pct": 0.35,
        "min_processing_fee": 2000,
        "max_processing_fee": 10000,
        "perks": [
            "Special 0.05% concession for women applicants",
            "Zero prepayment / foreclosure penalty",
            "Backed by India's largest public sector bank"
        ],
        "turnaround_days": "3-5 Days",
        "max_tenure_years": 30,
        "popular": True,
    },
    {
        "id": "hdfc",
        "name": "HDFC Bank",
        "short_name": "HDFC",
        "type": "Private Sector",
        "icon": "🏦",
        "badge_class": "badge-hdfc",
        "tag": "Fastest Approval",
        "base_rate": 8.50,
        "min_income": 25000,
        "requires_credit": True,
        "income_multiplier": 65,
        "processing_fee_pct": 0.50,
        "min_processing_fee": 3000,
        "max_processing_fee": 15000,
        "perks": [
            "Instant digital in-principle sanction",
            "Minimal documentation for salaried applicants",
            "Special discounted rates for existing account holders"
        ],
        "turnaround_days": "24-48 Hours",
        "max_tenure_years": 30,
        "popular": True,
    },
    {
        "id": "icici",
        "name": "ICICI Bank",
        "short_name": "ICICI",
        "type": "Private Sector",
        "icon": "💳",
        "badge_class": "badge-icici",
        "tag": "Instant Digital Disbursal",
        "base_rate": 8.60,
        "min_income": 25000,
        "requires_credit": True,
        "income_multiplier": 62,
        "processing_fee_pct": 0.50,
        "min_processing_fee": 3000,
        "max_processing_fee": 12500,
        "perks": [
            "100% paperless digital verification",
            "Flexible step-up and step-down EMI options",
            "Pre-approved top-up loans available"
        ],
        "turnaround_days": "1-3 Days",
        "max_tenure_years": 30,
        "popular": True,
    },
    {
        "id": "axis",
        "name": "Axis Bank",
        "short_name": "Axis",
        "type": "Private Sector",
        "icon": "🏛️",
        "badge_class": "badge-axis",
        "tag": "Flexible Repayment",
        "base_rate": 8.65,
        "min_income": 22000,
        "requires_credit": True,
        "income_multiplier": 60,
        "processing_fee_pct": 0.50,
        "min_processing_fee": 2500,
        "max_processing_fee": 12000,
        "perks": [
            "12 EMI waivers on timely regular repayments",
            "Zero pre-closure charges for floating rate loans",
            "Multi-property collateral acceptance"
        ],
        "turnaround_days": "2-4 Days",
        "max_tenure_years": 30,
        "popular": True,
    },
    {
        "id": "pnb",
        "name": "Punjab National Bank (PNB)",
        "short_name": "PNB",
        "type": "Public Sector",
        "icon": "🏢",
        "badge_class": "badge-pnb",
        "tag": "High Rural & Semiurban Approval",
        "base_rate": 8.45,
        "min_income": 18000,
        "requires_credit": False,  # More accommodating in rural/semiurban
        "income_multiplier": 58,
        "processing_fee_pct": 0.35,
        "min_processing_fee": 1500,
        "max_processing_fee": 8000,
        "perks": [
            "Concessional rates for semiurban and rural properties",
            "Subsidized processing fees for government employees",
            "Flexible income assessment for self-employed"
        ],
        "turnaround_days": "4-6 Days",
        "max_tenure_years": 30,
        "popular": True,
    },
    {
        "id": "bob",
        "name": "Bank of Baroda (BOB)",
        "short_name": "BOB",
        "type": "Public Sector",
        "icon": "🏦",
        "badge_class": "badge-bob",
        "tag": "Zero Prepayment Charges",
        "base_rate": 8.40,
        "min_income": 20000,
        "requires_credit": True,
        "income_multiplier": 60,
        "processing_fee_pct": 0.25,
        "min_processing_fee": 2000,
        "max_processing_fee": 7500,
        "perks": [
            "Lowest processing fee in public sector",
            "Baroda Advantage linked savings account benefits",
            "Free accidental insurance cover"
        ],
        "turnaround_days": "3-5 Days",
        "max_tenure_years": 30,
        "popular": True,
    },
    {
        "id": "kotak",
        "name": "Kotak Mahindra Bank",
        "short_name": "Kotak",
        "type": "Private Sector",
        "icon": "💎",
        "badge_class": "badge-kotak",
        "tag": "Customized Loan Tenure",
        "base_rate": 8.70,
        "min_income": 25000,
        "requires_credit": True,
        "income_multiplier": 65,
        "processing_fee_pct": 0.50,
        "min_processing_fee": 3000,
        "max_processing_fee": 15000,
        "perks": [
            "Dedicated relationship manager support",
            "Doorstep document collection service",
            "Express digital sanction letter in minutes"
        ],
        "turnaround_days": "2-3 Days",
        "max_tenure_years": 25,
        "popular": False,
    },
    {
        "id": "bajaj",
        "name": "Bajaj Finserv",
        "short_name": "Bajaj",
        "type": "NBFC / FinTech",
        "icon": "⚡",
        "badge_class": "badge-bajaj",
        "tag": "Highest Approval for Flexible Credit",
        "base_rate": 9.20,
        "min_income": 15000,
        "requires_credit": False,  # Accommodating for lower/no credit history
        "income_multiplier": 55,
        "processing_fee_pct": 0.75,
        "min_processing_fee": 2500,
        "max_processing_fee": 15000,
        "perks": [
            "Flexi Hybrid loan: Pay interest-only EMIs initially",
            "Approvals available even with past credit hiccups",
            "Superfast online approval within 24 hours"
        ],
        "turnaround_days": "24 Hours",
        "max_tenure_years": 25,
        "popular": True,
    },
    {
        "id": "federal",
        "name": "Federal Bank",
        "short_name": "Federal",
        "type": "Private Sector",
        "icon": "🌿",
        "badge_class": "badge-federal",
        "tag": "Minimal Documentation",
        "base_rate": 8.80,
        "min_income": 20000,
        "requires_credit": True,
        "income_multiplier": 58,
        "processing_fee_pct": 0.50,
        "min_processing_fee": 2500,
        "max_processing_fee": 10000,
        "perks": [
            "Transparent fee structure with zero hidden charges",
            "Fast-track processing for verified bank statement users",
            "Attractive rates for professional degree holders"
        ],
        "turnaround_days": "2-4 Days",
        "max_tenure_years": 30,
        "popular": False,
    },
    {
        "id": "tata",
        "name": "Tata Capital",
        "short_name": "Tata Capital",
        "type": "NBFC / FinTech",
        "icon": "💼",
        "badge_class": "badge-tata",
        "tag": "Flexible Income Assessment",
        "base_rate": 9.35,
        "min_income": 16000,
        "requires_credit": False,
        "income_multiplier": 55,
        "processing_fee_pct": 0.75,
        "min_processing_fee": 2500,
        "max_processing_fee": 15000,
        "perks": [
            "Co-applicant income pooling with flexible multipliers",
            "Pre-approved limits with instant online top-ups",
            "High loan eligibility even for new-to-credit applicants"
        ],
        "turnaround_days": "24-48 Hours",
        "max_tenure_years": 25,
        "popular": False,
    },
    {
        "id": "canara",
        "name": "Canara Bank",
        "short_name": "Canara",
        "type": "Public Sector",
        "icon": "🏛️",
        "badge_class": "badge-canara",
        "tag": "Affordable Govt. Rates",
        "base_rate": 8.45,
        "min_income": 18000,
        "requires_credit": False,
        "income_multiplier": 58,
        "processing_fee_pct": 0.35,
        "min_processing_fee": 1500,
        "max_processing_fee": 8500,
        "perks": [
            "Concession for women & rural properties",
            "Minimal processing charges and zero foreclosure fees",
            "Backed by leading public sector network"
        ],
        "turnaround_days": "3-5 Days",
        "max_tenure_years": 30,
        "popular": False,
    },
    {
        "id": "indusind",
        "name": "IndusInd Bank",
        "short_name": "IndusInd",
        "type": "Private Sector",
        "icon": "🏦",
        "badge_class": "badge-indusind",
        "tag": "Customized Repayment Terms",
        "base_rate": 8.75,
        "min_income": 20000,
        "requires_credit": True,
        "income_multiplier": 62,
        "processing_fee_pct": 0.50,
        "min_processing_fee": 2500,
        "max_processing_fee": 12000,
        "perks": [
            "Simplified documentation with video KYC",
            "Flexible EMI options for business owners",
            "Dedicated financial advisor"
        ],
        "turnaround_days": "2-3 Days",
        "max_tenure_years": 25,
        "popular": False,
    },
    {
        "id": "piramal",
        "name": "Piramal Capital & Housing",
        "short_name": "Piramal",
        "type": "NBFC / Housing Fin",
        "icon": "🏢",
        "badge_class": "badge-piramal",
        "tag": "High Approval for Self-Employed & Cash Incomes",
        "base_rate": 9.30,
        "min_income": 15000,
        "requires_credit": False,
        "income_multiplier": 55,
        "processing_fee_pct": 0.75,
        "min_processing_fee": 2000,
        "max_processing_fee": 12500,
        "perks": [
            "Informal income assessment available",
            "Quick approvals without stringent CIBIL constraints",
            "Special packages for Tier-2, Tier-3 and rural applicants"
        ],
        "turnaround_days": "24-48 Hours",
        "max_tenure_years": 25,
        "popular": False,
    },
]

def get_all_banks():
    """Returns metadata for all available banks."""
    return [
        {
            "id": b["id"],
            "name": b["name"],
            "short_name": b["short_name"],
            "type": b["type"],
            "icon": b["icon"],
            "base_rate": b["base_rate"],
            "tag": b["tag"],
            "popular": b.get("popular", False)
        }
        for b in BANKS
    ]

def calculate_emi(principal: float, annual_rate_pct: float, tenure_months: int) -> int:
    """Computes Monthly EMI given principal, annual interest rate %, and tenure in months."""
    if principal <= 0 or tenure_months <= 0:
        return 0
    monthly_rate = (annual_rate_pct / 100.0) / 12.0
    if monthly_rate == 0:
        return int(round(principal / tenure_months))
    
    emi = principal * monthly_rate * math.pow(1 + monthly_rate, tenure_months) / (math.pow(1 + monthly_rate, tenure_months) - 1)
    return int(round(emi))

def evaluate_single_bank(bank_def: dict, data: dict, base_prob: float) -> dict:
    """
    Evaluates applicant profile for a specific bank against underwriting rules.
    Returns detailed eligibility, dynamic rate, EMI, max amount, reasons if rejected, etc.
    """
    app_income = float(data.get("applicant_income", 0))
    coapp_income = float(data.get("coapplicant_income", 0))
    total_monthly_income = app_income + coapp_income
    
    raw_loan_amt = float(data.get("loan_amount", 1500000))
    # Normalize loan amount (if > 10000, it's in full rupees, else thousands)
    requested_loan = raw_loan_amt if raw_loan_amt > 10000 else raw_loan_amt * 1000
    
    tenure_months = int(data.get("loan_term", 360))
    if tenure_months <= 0:
        tenure_months = 360
    
    credit_good = data.get("credit_history") == "Yes" or str(data.get("credit_history")) == "1"
    is_grad = data.get("education") == "Graduate"
    is_self_employed = data.get("self_employed") == "Yes"
    prop_area = data.get("property_area", "Urban")
    gender = data.get("gender", "Male")
    
    # Calculate Max Eligible Loan Amount for this bank
    max_eligible_loan = total_monthly_income * bank_def["income_multiplier"]
    # Extra cushion for graduates and coapplicant income
    if is_grad:
        max_eligible_loan *= 1.05
    if coapp_income > 0:
        max_eligible_loan *= 1.08
    max_eligible_loan = int(round(max_eligible_loan / 10000.0) * 10000)

    # Bank-specific checks
    rejection_reasons = []
    
    # Check 1: Minimum income
    if total_monthly_income < bank_def["min_income"]:
        rejection_reasons.append(
            f"Minimum monthly household income requirement of ₹{bank_def['min_income']:,} not met (Current: ₹{int(total_monthly_income):,})."
        )
    
    # Check 2: Credit history requirement
    if bank_def["requires_credit"] and not credit_good:
        rejection_reasons.append(
            f"{bank_def['name']} requires a positive credit history guideline (Score 700+)."
        )
    
    # Check 3: Loan to income feasibility (requested vs max eligible)
    if requested_loan > (max_eligible_loan * 1.35):
        rejection_reasons.append(
            f"Requested loan (₹{int(requested_loan):,}) exceeds maximum debt-to-income capacity limit (Max eligible: ₹{max_eligible_loan:,})."
        )
    
    # Check 4: Base ML probability check (only strict banks enforce ML cutoff on credit)
    if bank_def["requires_credit"] and (base_prob < 0.45 or not credit_good):
        rejection_reasons.append(
            f"{bank_def['name']} automated credit scoring requires a higher approval probability and good credit history."
        )

    is_eligible = len(rejection_reasons) == 0

    # Dynamic Interest Rate calculation based on profile
    adjusted_rate = bank_def["base_rate"]
    
    # Credit discount/penalty
    if credit_good:
        adjusted_rate -= 0.10
    else:
        adjusted_rate += 0.60
        
    # Gender concession (e.g. SBI/PNB 0.05% discount for female primary applicants)
    if gender == "Female" and bank_def["id"] in ["sbi", "pnb", "bob"]:
        adjusted_rate -= 0.05
        
    # High income discount (> 75,000/mo)
    if total_monthly_income >= 75000:
        adjusted_rate -= 0.15
    elif total_monthly_income >= 45000:
        adjusted_rate -= 0.05
        
    # Property area adjustment
    if prop_area == "Rural" and bank_def["id"] in ["pnb", "sbi"]:
        adjusted_rate -= 0.05
        
    # Round to 2 decimals
    adjusted_rate = max(7.99, round(adjusted_rate, 2))
    
    # Calculate EMI
    actual_loan_eval = min(requested_loan, max_eligible_loan) if is_eligible else requested_loan
    monthly_emi = calculate_emi(actual_loan_eval, adjusted_rate, tenure_months)
    
    # Calculate Processing Fee
    proc_fee = (requested_loan * (bank_def["processing_fee_pct"] / 100.0))
    proc_fee = max(bank_def["min_processing_fee"], min(proc_fee, bank_def["max_processing_fee"]))
    proc_fee_str = f"₹{int(proc_fee):,} ({bank_def['processing_fee_pct']}%)"

    # Match score (0 to 100%)
    match_score = int(min(99, max(50, (base_prob * 60) + (40 if is_eligible else 10) + (10 if total_monthly_income > 40000 else 0))))
    if not is_eligible:
        match_score = max(35, match_score - 30)

    return {
        "id": bank_def["id"],
        "name": bank_def["name"],
        "short_name": bank_def["short_name"],
        "type": bank_def["type"],
        "icon": bank_def["icon"],
        "tag": bank_def["tag"],
        "badge_class": bank_def["badge_class"],
        "eligible": is_eligible,
        "interest_rate": f"{adjusted_rate:.2f}%",
        "raw_rate": adjusted_rate,
        "monthly_emi": monthly_emi,
        "monthly_emi_formatted": f"₹{monthly_emi:,}",
        "max_amount": max_eligible_loan,
        "max_amount_formatted": f"₹{max_eligible_loan:,}",
        "processing_fee": proc_fee_str,
        "turnaround": bank_def["turnaround_days"],
        "match_score": match_score,
        "perks": bank_def["perks"],
        "rejection_reasons": rejection_reasons,
        "status_message": (
            f"🎉 Congratulations! You meet all underwriting standards for {bank_def['name']}."
            if is_eligible else
            f"⚠️ You do not meet the standard threshold for {bank_def['name']} at this time."
        )
    }

def evaluate_all_banks(data: dict, base_prob: float, selected_bank_id: str = None) -> dict:
    """
    Evaluates selected bank (if specified) and provides 5–6 top approved/alternative bank options.
    """
    evaluations = [evaluate_single_bank(b, data, base_prob) for b in BANKS]
    
    # 1. Selected Bank Result
    selected_bank_result = None
    if selected_bank_id and selected_bank_id != "any":
        for eval_item in evaluations:
            if eval_item["id"] == selected_bank_id:
                selected_bank_result = eval_item
                break
    
    # If no specific bank selected or "any", pick top matched bank
    if not selected_bank_result:
        # Default to highest eligible match or SBI
        eligible_banks = [b for b in evaluations if b["eligible"]]
        if eligible_banks:
            selected_bank_result = eligible_banks[0]
        else:
            selected_bank_result = evaluations[0]
        selected_bank_result = {**selected_bank_result, "is_default_selection": True}

    # 2. Curate 5 to 6 Top Alternative / Recommended Banks
    # Priority: Eligible banks first (sorted by interest rate ascending & match score descending)
    # Exclude the selected bank from alternatives so user sees 5–6 distinct options
    alternatives_pool = [b for b in evaluations if b["id"] != selected_bank_result["id"]]
    
    eligible_alternatives = [b for b in alternatives_pool if b["eligible"]]
    eligible_alternatives.sort(key=lambda x: (x["raw_rate"], -x["match_score"]))
    
    non_eligible_alternatives = [b for b in alternatives_pool if not b["eligible"]]
    non_eligible_alternatives.sort(key=lambda x: (-x["match_score"], x["raw_rate"]))
    
    # Select 6 banks
    final_alternatives = eligible_alternatives[:6]
    if len(final_alternatives) < 6:
        # Fill remaining spots with nearest flexible/NBFC alternative lenders
        needed = 6 - len(final_alternatives)
        final_alternatives.extend(non_eligible_alternatives[:needed])
        
    return {
        "selected_bank": selected_bank_result,
        "alternative_banks": final_alternatives[:6],
        "total_eligible_banks": sum(1 for b in evaluations if b["eligible"]),
        "total_evaluated": len(evaluations)
    }
