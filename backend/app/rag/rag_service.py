from pathlib import Path

from app.extraction.document_extractor import (
    DocumentExtractor,
)
from app.extraction.text_processor import (
    TextProcessor,
)
from app.rag.embedding_service import (
    EmbeddingService,
)
from app.rag.vector_store import (
    FAISSVectorStore,
)


class RAGService:
    """Manage document indexing and semantic search."""

    def __init__(self):
        # Embedding model
        self.embedding_service = EmbeddingService()

        # FAISS vector store
        self.vector_store = FAISSVectorStore(
            dimension=384
        )

        # Document metadata
        self.documents = {}

    def index_document(
        self,
        document_id: str,
        file_path: str,
        filename: str,
    ) -> dict:
        """
        Extract, process, embed and index a document.
        """

        extension = Path(
            file_path
        ).suffix.lower()

        # ==========================================
        # PDF
        # ==========================================

        if extension == ".pdf":

            pages = (
                DocumentExtractor
                .extract_pdf_pages(
                    file_path
                )
            )

            chunks = (
                TextProcessor.process_pages(
                    pages
                )
            )

        # ==========================================
        # DOCX / XLSX
        # ==========================================

        else:

            extracted_text = (
                DocumentExtractor.extract(
                    file_path
                )
            )

            chunks = (
                TextProcessor.process(
                    extracted_text
                )
            )

            # DOCX/XLSX currently don't have
            # page-level extraction.
            pages = []

        # ==========================================
        # Validate extraction
        # ==========================================

        if not chunks:

            raise ValueError(
                "No text could be extracted "
                "from the document."
            )

        # ==========================================
        # Generate embeddings
        # ==========================================

        chunk_texts = [
            chunk.text
            for chunk in chunks
        ]

        embeddings = (
            self.embedding_service
            .embed_texts(
                chunk_texts
            )
        )

        # ==========================================
        # Prepare metadata for FAISS
        # ==========================================

        chunk_metadata = [
            {
                "document_id": document_id,
                "filename": filename,
                "chunk_id": chunk.chunk_id,
                "page_number": chunk.page_number,
                "text": chunk.text,
                "section": chunk.section,
                "language": chunk.language,
                "extraction_method": (
                    chunk.extraction_method
                ),
                "confidence": chunk.confidence,
            }
            for chunk in chunks
        ]

        # ==========================================
        # Add vectors + metadata to FAISS
        # ==========================================

        self.vector_store.add(
            embeddings,
            chunk_metadata,
        )

        # ==========================================
        # Store document information
        # ==========================================

        self.documents[document_id] = {
            "document_id": document_id,
            "filename": filename,
            "file_path": file_path,
            "file_type": extension,
            "chunks": chunks,
        }

        # ==========================================
        # Return processing information
        # ==========================================

        return {
            "document_id": document_id,
            "filename": filename,
            "file_type": extension,
            "characters_extracted": sum(
                len(chunk.text)
                for chunk in chunks
            ),
            "chunks_created": len(chunks),
            "pages_processed": (
                len(pages)
                if extension == ".pdf"
                else None
            ),
        }

    def search(
        self,
        query: str,
        top_k: int = 5,
    ) -> list[dict]:
        """
        Perform semantic search over
        indexed documents.
        """

        if not query.strip():

            raise ValueError(
                "Search query cannot be empty."
            )

        # ==========================================
        # Convert query into embedding
        # ==========================================

        query_embedding = (
            self.embedding_service
            .embed_text(
                query
            )
        )

        # ==========================================
        # Search FAISS
        # ==========================================

        results = (
            self.vector_store.search(
                query_embedding,
                top_k=top_k,
            )
        )

        return results