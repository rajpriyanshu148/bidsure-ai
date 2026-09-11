from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.rag.dependencies import rag_service


router = APIRouter(
    prefix="/search",
    tags=["Search"],
)


class SearchRequest(BaseModel):
    query: str = Field(
        min_length=1,
        description="Question or search query",
    )

    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
    )


@router.post("")
def search_documents(
    request: SearchRequest,
):
    """Perform semantic search over indexed documents."""

    try:
        results = rag_service.search(
            query=request.query,
            top_k=request.top_k,
        )

        return {
            "query": request.query,
            "results": results,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {exc}",
        )