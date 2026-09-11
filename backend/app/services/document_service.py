import os
import fitz  # PyMuPDF
from typing import List, Dict, Any, Tuple
from app.core.config import settings
from app.models.document import DocumentType
from app.ai.entity_extractor import entity_extractor


class StorageProvider:
    def __init__(self, base_dir: str = settings.STORAGE_DIR):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def save_file(self, filename: str, content: bytes) -> str:
        safe_name = os.path.basename(filename)
        dest_path = os.path.join(self.base_dir, safe_name)
        # If exists, deduplicate name
        if os.path.exists(dest_path):
            name, ext = os.path.splitext(safe_name)
            import uuid
            dest_path = os.path.join(self.base_dir, f"{name}_{uuid.uuid4().hex[:6]}{ext}")
        with open(dest_path, "wb") as f:
            f.write(content)
        return dest_path


storage_provider = StorageProvider()


class DocumentService:
    @staticmethod
    def classify_document(text: str, filename: str) -> str:
        text_lower = text.lower()
        file_lower = filename.lower()

        if "gstin" in text_lower or "form gst reg-06" in text_lower or "goods and services tax" in text_lower or "gst" in file_lower:
            return DocumentType.GST_CERTIFICATE.value
        elif "permanent account number" in text_lower or "income tax department" in text_lower and "pan" in file_lower:
            return DocumentType.PAN_CARD.value
        elif "udyam" in text_lower or "msme" in text_lower or "udyam" in file_lower:
            return DocumentType.UDYAM_CERTIFICATE.value
        elif "itr-v" in text_lower or "indian income tax return" in text_lower or "assessment year" in text_lower or "itr" in file_lower:
            return DocumentType.ITR.value
        elif "balance sheet" in text_lower or "profit and loss" in text_lower or "auditor's report" in text_lower or "balancesheet" in file_lower:
            return DocumentType.BALANCE_SHEET.value
        elif "manufacturer's authorization" in text_lower or "oem authorization" in text_lower or "maf" in file_lower or "oem" in file_lower:
            return DocumentType.OEM_AUTHORIZATION.value
        elif "make in india" in text_lower or "local content" in text_lower or "local supplier" in text_lower or "mii" in file_lower:
            return DocumentType.MAKE_IN_INDIA.value
        elif "debarment" in text_lower or "blacklisting" in text_lower or "not debarred" in text_lower or "affidavit" in file_lower:
            return DocumentType.BLACKLISTING_AFFIDAVIT.value
        elif "tender" in file_lower or "bid document" in text_lower:
            return DocumentType.TENDER_DOCUMENT.value

        return DocumentType.OTHER.value

    def process_pdf(self, file_path: str, filename: str) -> Tuple[str, List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Extracts text from PDF page by page using PyMuPDF.
        Runs EntityExtractor on extracted text.
        Returns: (doc_type, pages_data, entities_data)
        """
        pages_data: List[Dict[str, Any]] = []
        all_entities: List[Dict[str, Any]] = []
        full_text = ""

        try:
            doc = fitz.open(file_path)
            total_pages = len(doc)
            for page_idx in range(total_pages):
                page = doc[page_idx]
                page_text = page.get_text()
                page_num = page_idx + 1

                pages_data.append({
                    "page_number": page_num,
                    "text_content": page_text,
                    "has_images": len(page.get_images()) > 0,
                })

                full_text += f"\n--- Page {page_num} ---\n" + page_text

                # Extract entities from page
                page_entities = entity_extractor.extract_from_text(page_text, page_number=page_num)
                all_entities.extend(page_entities)

            doc.close()
        except Exception as e:
            full_text = f"Error reading PDF text: {str(e)}"

        doc_type = self.classify_document(full_text, filename)
        return doc_type, pages_data, all_entities


document_service = DocumentService()
