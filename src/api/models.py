from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from enum import Enum as PyEnum
from sqlalchemy import func
from typing import Optional, List



db = SQLAlchemy()

#avoid conflicts when serializing timezones in "updated_at" and "created_at"
def _iso(dt): 
    return dt and dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

class UserRole(PyEnum):
    READER = "reader" 
    WRITER = "writer"
    ADMIN = "admin"

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    display_name:Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    user_role: Mapped[UserRole] = mapped_column(db.Enum(UserRole, name="user_role"), nullable=False, default=UserRole.READER, server_default="reader")
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    stories: Mapped[List["Story"]] = relationship(back_populates="author", cascade="all")
    comments: Mapped[List["Comment"]] = relationship(back_populates="user")
    followers: Mapped[List["Follower"]] = relationship(back_populates="following", foreign_keys="Follower.following_id",cascade="all")
    following: Mapped[List["Follower"]] = relationship(back_populates="follower",foreign_keys="Follower.follower_id",cascade="all")


    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "display_name": self.display_name,
            "user_role": self.user_role.value,
            "created_at": _iso(self.created_at),
            "updated_at": _iso(self.updated_at)
        }
    
class Story(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    author_id: Mapped[int] = mapped_column(db.ForeignKey("user.id", ondelete="RESTRICT"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    synopsis: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft", server_default="draft")
    published_at: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True))

    author: Mapped[User] = relationship(back_populates="stories")
    chapters: Mapped[List["Chapter"]] = relationship(back_populates="story", cascade="all", order_by="Chapter.number")
    comments: Mapped[List["Comment"]] = relationship(back_populates="story", foreign_keys="Comment.story_id")

    def serialize(self):
        return {
            "id": self.id,
            "author_id": self.author_id,
            "title": self.title, 
            "synopsis": self.synopsis,
            "status": self.status, 
            "published_at": self.published_at, 
            "created_at": _iso(self.created_at), 
            "updated_at": _iso(self.updated_at),
            "deleted_at": self.deleted_at
        }

class Chapter(db.Model): 
    id: Mapped[int] = mapped_column(primary_key=True)
    story_id: Mapped[int] = mapped_column(db.ForeignKey("story.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(String(600), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft", server_default="draft")
    published_at: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True))

    story: Mapped[Story] = relationship(back_populates="chapters")
    comments: Mapped[List["Comment"]] = relationship(back_populates="chapter", foreign_keys="Comment.chapter_id")

    def serialize(self):
        return {
            "id": self.id,
            "story_id": self.story_id,
            "title": self.title, 
            "number": self.number, 
            "content": self.content,
            "status": self.status, 
            "published_at": self.published_at, 
            "created_at": _iso(self.created_at), 
            "updated_at": _iso(self.updated_at),
            "deleted_at": self.deleted_at
        }

class Comment(db.Model): 
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    story_id: Mapped[int] = mapped_column(db.ForeignKey("story.id", ondelete="CASCADE"), nullable=False)
    text: Mapped[str] = mapped_column(String(280), nullable=False)
    created_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True))

    user: Mapped["User"] = relationship(back_populates="comments")
    story: Mapped[Optional["Story"]] = relationship(back_populates="comments")

    def serialize(self):
        return {
            "id": self.id,
            "text": self.text,
            "created_at": _iso(self.created_at), 
            "updated_at": _iso(self.updated_at),
            "deleted_at": self.deleted_at
        }
    
class Follower(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    follower_id: Mapped[int] = mapped_column(db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    following_id: Mapped[int] = mapped_column(db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)

    follower: Mapped["User"] = relationship(back_populates="following", foreign_keys=[follower_id])
    following: Mapped["User"] = relationship(back_populates="follower", foreign_keys=[following_id])
