from typing import List, Dict, Any, Optional
import math
import re


class EvidenceChunk:
    def __init__(
        self,
        document_id: str,
        document_name: str,
        document_type: str,
        page_number: int,
        text: str,
    ):
        self.document_id = document_id
        self.document_name = document_name
        self.document_type = document_type
        self.page_number = page_number
        self.text = text


class LightweightRAG:
    def __init__(self):
        self.chunks: List[EvidenceChunk] = []

    def index_document(
        self,
        document_id: str,
        document_name: str,
        document_type: str,
        pages: List[Dict[str, Any]],
    ):
        for page in pages:
            page_num = page.get("page_number", 1)
            content = page.get("text_content") or ""
            if not content.strip():
                continue

            # Split into reasonable chunks (~300 words)
            paragraphs = content.split("\n\n")
            for para in paragraphs:
                p_clean = para.strip()
                if len(p_clean) > 20:
                    self.chunks.append(
                        EvidenceChunk(
                            document_id=document_id,
                            document_name=document_name,
                            document_type=document_type,
                            page_number=page_num,
                            text=p_clean,
                        )
                    )

    def retrieve_evidence(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.chunks:
            return []

        query_terms = set(re.findall(r"\w+", query.lower()))
        if not query_terms:
            return []

        scored_chunks = []
        for chunk in self.chunks:
            chunk_terms = set(re.findall(r"\w+", chunk.text.lower()))
            overlap = len(query_terms.intersection(chunk_terms))
            if overlap > 0:
                score = overlap / (math.sqrt(len(query_terms)) * math.sqrt(len(chunk_terms)) + 1e-5)
                scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)

        results = []
        for score, chunk in scored_chunks[:top_k]:
            results.append({
                "document_id": chunk.document_id,
                "document_name": chunk.document_name,
                "document_type": chunk.document_type,
                "page_number": chunk.page_number,
                "text": chunk.text,
                "score": round(score, 3),
            })
        return results

    def clear(self):
        self.chunks.clear()


rag_service = LightweightRAG()
