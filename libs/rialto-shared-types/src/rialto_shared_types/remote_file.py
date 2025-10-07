from pydantic import BaseModel

class RemoteFile(BaseModel):
    """Remote file model."""
    url: str
    content_type: str