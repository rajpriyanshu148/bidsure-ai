import faiss
import numpy as np


class FAISSVectorStore:
    """Simple local FAISS vector store."""

    def __init__(
        self,
        dimension: int = 384,
    ):
        self.dimension = dimension

        self.index = faiss.IndexFlatIP(
            dimension
        )

        self.metadata = []

    def add(
        self,
        embeddings: list[list[float]],
        metadata: list[dict],
    ) -> None:
        """Add embeddings and metadata."""

        if len(embeddings) != len(metadata):
            raise ValueError(
                "Number of embeddings must match "
                "number of metadata records."
            )

        vectors = np.asarray(
            embeddings,
            dtype="float32",
        )

        self.index.add(vectors)

        self.metadata.extend(
            metadata
        )

    def search(
        self,
        query_embedding: list[float],
        top_k: int = 5,
    ) -> list[dict]:
        """Search for similar document chunks."""

        if self.index.ntotal == 0:
            return []

        query_vector = np.asarray(
            [query_embedding],
            dtype="float32",
        )

        scores, indices = (
            self.index.search(
                query_vector,
                min(
                    top_k,
                    self.index.ntotal,
                ),
            )
        )

        results = []

        for score, index in zip(
            scores[0],
            indices[0],
        ):

            result = {
                "score": float(score),
                **self.metadata[index],
            }

            results.append(result)

        return results