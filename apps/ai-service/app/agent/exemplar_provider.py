from typing import List
from pydantic import BaseModel
import logging

from app.agent.exemplars.tax_doc_collection import TAX_DOCUMENT_COLLECTION_VALIDATION_EXEMPLAR_SOME_MISSING

logger = logging.getLogger(__name__)

class ExemplarRequest(BaseModel):
    agent_execution_id: str

class Exemplar(BaseModel):
    title: str
    content: str

class ExemplarResponse(BaseModel):
    exemplars: List[Exemplar]

class ExemplarProvider:
    """
    Provides a gateway to the event bus.
    """

    def __init__(self):
        logger.info(f"Initializing ExemplarProvider")
        self.exemplars = [
            Exemplar(title="Tax Document Collection Validation, Some Missing", content=TAX_DOCUMENT_COLLECTION_VALIDATION_EXEMPLAR_SOME_MISSING)
        ]

    def get_exemplars(self, request: ExemplarRequest) -> ExemplarResponse:
        logger.info(f"ExemplarProvider.get_exemplars")
        return ExemplarResponse(exemplars=self.exemplars)


