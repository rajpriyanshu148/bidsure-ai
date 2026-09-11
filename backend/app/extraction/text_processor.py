import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class TextChunk:
    """Represents one processed document chunk."""

    chunk_id: int
    text: str

    start_char: int
    end_char: int

    page_number: Optional[int] = None
    section: Optional[str] = None

    language: str = "unknown"
    extraction_method: str = "text"

    confidence: Optional[float] = None


class TextProcessor:
    """Clean and split document text."""

    @staticmethod
    def clean_text(text: str) -> str:
        """Clean extracted text."""

        if not text:
            return ""

        text = text.replace(
            "\r\n",
            "\n",
        )

        text = text.replace(
            "\r",
            "\n",
        )

        text = re.sub(
            r"[ \t]+",
            " ",
            text,
        )

        text = re.sub(
            r"\n{3,}",
            "\n\n",
            text,
        )

        text = re.sub(
            r" *\n *",
            "\n",
            text,
        )

        return text.strip()

    @classmethod
    def chunk_page(
        cls,
        text: str,
        page_number: int,
        chunk_size: int = 1200,
        overlap: int = 200,
        starting_chunk_id: int = 0,
    ) -> list[TextChunk]:
        """Create chunks from one document page."""

        cleaned_text = cls.clean_text(text)

        if not cleaned_text:
            return []

        if overlap >= chunk_size:
            raise ValueError(
                "overlap must be smaller than chunk_size"
            )

        chunks = []

        start = 0
        chunk_id = starting_chunk_id

        while start < len(cleaned_text):

            end = min(
                start + chunk_size,
                len(cleaned_text),
            )

            chunk = cleaned_text[
                start:end
            ].strip()

            if chunk:
                chunks.append(
                    TextChunk(
                        chunk_id=chunk_id,
                        text=chunk,
                        start_char=start,
                        end_char=end,
                        page_number=page_number,
                    )
                )

                chunk_id += 1

            if end >= len(cleaned_text):
                break

            start = end - overlap

        return chunks

    @classmethod
    def process_pages(
        cls,
        pages: list[dict],
        chunk_size: int = 1200,
        overlap: int = 200,
    ) -> list[TextChunk]:
        """Process multiple pages while preserving page numbers."""

        all_chunks = []

        chunk_id = 0

        for page in pages:

            page_chunks = cls.chunk_page(
                text=page["text"],
                page_number=page["page_number"],
                chunk_size=chunk_size,
                overlap=overlap,
                starting_chunk_id=chunk_id,
            )

            all_chunks.extend(
                page_chunks
            )

            chunk_id += len(page_chunks)

        return all_chunks

    @classmethod
    def process(
        cls,
        text: str,
        chunk_size: int = 1200,
        overlap: int = 200,
    ) -> list[TextChunk]:
        """Process a single text document."""

        cleaned_text = cls.clean_text(text)

        return cls.chunk_page(
            text=cleaned_text,
            page_number=1,
            chunk_size=chunk_size,
            overlap=overlap,
        )