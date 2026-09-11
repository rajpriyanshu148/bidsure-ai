from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models.audit import AuditLog


class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        action: str,
        entity_type: str,
        entity_id: str,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        old_value: Optional[Any] = None,
        new_value: Optional[Any] = None,
        reason: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLog:
        log_entry = AuditLog(
            user_id=user_id,
            user_email=user_email or "system@bidsure.gov.in",
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_value=old_value,
            new_value=new_value,
            reason=reason,
            ip_address=ip_address or "127.0.0.1",
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry


audit_service = AuditService()
