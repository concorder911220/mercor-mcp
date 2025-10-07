from sqlalchemy import Column, String, DateTime, Integer, Text, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.infrastructure.database.connection import Base


class UserRoleEnum(enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"
    MANAGER = "MANAGER"


class ServiceTypeEnum(enum.Enum):
    OUTLOOK = "OUTLOOK"
    SALESFORCE = "SALESFORCE"
    DROPBOX = "DROPBOX"
    EMONEY = "EMONEY"
    QUICKBOOKS = "QUICKBOOKS"


class UserModel(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, nullable=False)
    email = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRoleEnum), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    extra_metadata = Column(JSON)

    # Relationships
    clients = relationship("ClientModel", back_populates="user")
    tasks = relationship("TaskModel", back_populates="user")
    user_tokens = relationship("UserTokenModel", back_populates="user")
    conversations = relationship("ConversationModel", back_populates="user")


class TaskModel(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    version = Column(Integer, nullable=False)
    request = Column(String, nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"))
    current_status = Column(String, nullable=False)
    current_status_timestamp = Column(DateTime(timezone=True), nullable=False)
    current_status_note = Column(Text)
    timeline = Column(DateTime(timezone=True), nullable=False)
    context = Column(JSON)
    extra_metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id"), nullable=True)

    # Relationships
    user = relationship("UserModel", back_populates="tasks")
    client = relationship("ClientModel", back_populates="tasks")
    message  = relationship("MessageModel", back_populates="tasks")
    parent = relationship("TaskModel", remote_side=[id])

class ConversationModel(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("UserModel", back_populates="conversations")
    messages = relationship("MessageModel", back_populates="conversation")
class MessageModel(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_type = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    role = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    extra_metadata = Column(JSON)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)

    # Relationships
    conversation = relationship("ConversationModel", back_populates="messages")
    tasks = relationship("TaskModel", back_populates="message")
    attachments = relationship("AttachmentModel", back_populates="message", cascade="all, delete-orphan")


class AttachmentModel(Base):
    __tablename__ = "attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id"), nullable=False)
    filename = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    s3_url = Column(String, nullable=False)
    s3_key = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    message = relationship("MessageModel", back_populates="attachments")


class ClientModel(Base):
    __tablename__ = "clients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    contact_phone = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    client_settings = Column(JSON)
    extra_metadata = Column(JSON)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Relationships
    user = relationship("UserModel", back_populates="clients")
    tasks = relationship("TaskModel", back_populates="client")
    documents = relationship("DocumentModel", back_populates="client")


class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    document_link = Column(String, nullable=False)

    # Relationships
    client = relationship("ClientModel", back_populates="documents")


class UserTokenModel(Base):
    __tablename__ = "user_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    service_type = Column(SQLEnum(ServiceTypeEnum), nullable=False)
    token = Column(JSONB, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    # Relationships
    user = relationship("UserModel", back_populates="user_tokens") 