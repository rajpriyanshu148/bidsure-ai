from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    action: str
    entity_type: str
    entity_id: str
    old_value: Optional[Any] = None
    new_value: Optional[Any] = None
    reason: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
