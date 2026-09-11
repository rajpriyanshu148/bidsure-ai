from app.rag.embedding_service import EmbeddingService
from app.rag.vector_store import FAISSVectorStore


def main():
    embedding_service = EmbeddingService()

    texts = [
        "The bidder must have minimum annual turnover of INR 5 crore.",
        "The bidder must have completed three similar projects.",
        "The tender requires submission of audited financial statements.",
        "The bidder must provide GST registration details.",
    ]

    print("Generating embeddings...")

    embeddings = embedding_service.embed_texts(
        texts
    )

    print(
        f"Embedding dimension: {len(embeddings[0])}"
    )

    vector_store = FAISSVectorStore(
        dimension=len(embeddings[0])
    )

    vector_store.add(
        embeddings,
        texts,
    )

    query = (
        "What is the minimum financial "
        "turnover required?"
    )

    print(f"\nQuery: {query}")

    query_embedding = (
        embedding_service.embed_text(query)
    )

    results = vector_store.search(
        query_embedding,
        top_k=3,
    )

    print("\nSearch results:")

    for result in results:
        print(
            f"\nScore: {result['score']:.4f}"
        )
        print(result["text"])


if __name__ == "__main__":
    main()