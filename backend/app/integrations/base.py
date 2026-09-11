from abc import ABC, abstractmethod
from typing import Dict, Any


class GovernmentVerificationProvider(ABC):
    source_name: str
    description: str

    @abstractmethod
    def verify(self, query_param: str) -> Dict[str, Any]:
        """
        Queries the government database or adapter.
        Returns realistic structured JSON matching statutory formats.
        """
        pass
