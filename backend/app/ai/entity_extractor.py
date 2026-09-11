import re
from typing import List, Dict, Any, Optional

GSTIN_PATTERN = re.compile(r"\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b")
PAN_PATTERN = re.compile(r"\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b")
UDYAM_PATTERN = re.compile(r"\b(UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7})\b")
TURNOVER_PATTERN = re.compile(
    r"(?:(?:Total\s+)?(?:Annual\s+)?(?:Average\s+)?(?:Turnover|Revenue|Gross\s+Receipts|Sales)|AY\s*202\d-\d{2})\s*(?:for\s+[^\n:]{1,30})?\s*(?:of|is|:|=|—|-)?\s*₹?\s*(\d+(?:\.\d+)?)\s*(Crore|Cr|Lakh|Lakhs|INR|Rupees)?",
    re.IGNORECASE,
)
LOCAL_CONTENT_PATTERN = re.compile(
    r"(?:(?:Domestic\s+)?(?:Local\s+)?Content|Domestic\s+Value\s+Addition|Local\s+Value\s+Addition)\s*(?:is|of|:|=|—|-)?\s*(\d+(?:\.\d+)?)\s*%",
    re.IGNORECASE,
)
EXPIRY_PATTERN = re.compile(
    r"(?:Valid\s+(?:until|thru|upto|to)|Expiry\s+Date|Valid\s+Till|Date\s+of\s+Expiry)\s*(?:is|:|=|—|-)?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+[A-Za-z]+\s+\d{4})",
    re.IGNORECASE,
)
COMPANY_NAME_PATTERN = re.compile(
    r"\b([A-Z][A-Za-z0-9\s.,&-]+(?:\s+PRIVATE\s+LIMITED|\s+PVT\s+LTD|\s+LIMITED|\s+LTD|\s+ENTERPRISES|\s+SOLUTIONS|\s+INDUSTRIES))\b",
    re.IGNORECASE,
)


class EntityExtractor:
    def extract_from_text(self, text: str, page_number: int = 1, doc_type: str = "OTHER") -> List[Dict[str, Any]]:
        entities: List[Dict[str, Any]] = []

        if not text:
            return entities

        # 1. GSTIN
        for match in GSTIN_PATTERN.finditer(text):
            val = match.group(1).upper()
            entities.append({
                "entity_type": "GSTIN",
                "raw_value": val,
                "normalized_value": val,
                "confidence": 0.99,
                "page_number": page_number,
            })

        # 2. PAN
        for match in PAN_PATTERN.finditer(text):
            val = match.group(1).upper()
            # Ensure it's not part of a GSTIN
            start, end = match.span()
            if start >= 2 and text[start - 2 : start].isdigit():
                continue
            entities.append({
                "entity_type": "PAN",
                "raw_value": val,
                "normalized_value": val,
                "confidence": 0.99,
                "page_number": page_number,
            })

        # 3. UDYAM
        for match in UDYAM_PATTERN.finditer(text):
            val = match.group(1).upper()
            entities.append({
                "entity_type": "UDYAM_NUMBER",
                "raw_value": val,
                "normalized_value": val,
                "confidence": 0.98,
                "page_number": page_number,
            })

        # 4. Turnover
        for match in TURNOVER_PATTERN.finditer(text):
            num_str = match.group(1)
            unit = (match.group(2) or "").lower()
            try:
                num = float(num_str)
                if "crore" in unit or "cr" in unit:
                    inr_value = num * 10000000.0
                elif "lakh" in unit:
                    inr_value = num * 100000.0
                else:
                    inr_value = num * 10000000.0 if num < 500 else num
                raw_display = f"₹{num_str} {match.group(2) or 'Crore'}"
                entities.append({
                    "entity_type": "TURNOVER",
                    "raw_value": raw_display,
                    "normalized_value": str(inr_value),
                    "confidence": 0.94,
                    "page_number": page_number,
                })
            except Exception:
                pass

        # 5. Local Content %
        for match in LOCAL_CONTENT_PATTERN.finditer(text):
            pct_str = match.group(1)
            try:
                pct = float(pct_str)
                entities.append({
                    "entity_type": "LOCAL_CONTENT_PCT",
                    "raw_value": f"{pct}%",
                    "normalized_value": str(pct),
                    "confidence": 0.95,
                    "page_number": page_number,
                })
            except Exception:
                pass

        # 6. Expiry Date
        for match in EXPIRY_PATTERN.finditer(text):
            date_str = match.group(1).strip()
            entities.append({
                "entity_type": "EXPIRY_DATE",
                "raw_value": date_str,
                "normalized_value": date_str,
                "confidence": 0.92,
                "page_number": page_number,
            })

        # 7. Company Name
        for match in COMPANY_NAME_PATTERN.finditer(text):
            raw_cname = match.group(1).strip()
            if len(raw_cname) > 5 and not any(e["entity_type"] == "COMPANY_NAME" for e in entities):
                entities.append({
                    "entity_type": "COMPANY_NAME",
                    "raw_value": raw_cname,
                    "normalized_value": raw_cname.upper(),
                    "confidence": 0.91,
                    "page_number": page_number,
                })

        return entities


entity_extractor = EntityExtractor()
