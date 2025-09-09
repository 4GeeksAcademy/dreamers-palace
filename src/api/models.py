import arrow
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from enum import Enum as PyEnum
from sqlalchemy import func
from typing import Optional, List

db = SQLAlchemy()

def _iso(dt):
    if not dt: 
        return None
    return arrow.get(dt).to('utc').format('YYYY-MM-DDTHH:mm:ss[Z]')

def _human(dt, locale='en'):
    if not dt:
        return None
    return arrow.get(dt).humanize(locale=locale)
    
class UserRole(PyEnum):
    READER = "READER"
    WRITER = "WRITER"
    ADMIN = "ADMIN"

class StoryStatus(PyEnum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    DELETED = "DELETED"

class ChapterStatus(PyEnum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    DELETED = "DELETED"

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    display_name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    bio: Mapped[Optional[str]] = mapped_column(String(1000))
    location: Mapped[Optional[str]] = mapped_column(String(120))
    user_role: Mapped[UserRole] = mapped_column(
        db.Enum(
            UserRole,
            name="user_role",
            native_enum=False,
            create_constraint=True,
            validate_strings=True,
        ),
        nullable=False,
        default=UserRole.READER,
        server_default=UserRole.READER.value,
    )
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    stories: Mapped[List["Story"]] = relationship(back_populates="author", cascade="all")
    story_views: Mapped[List["StoryView"]] = relationship(back_populates="user", cascade="all")
    comments: Mapped[List["Comment"]] = relationship(back_populates="user")
    followers: Mapped[List["Follower"]] = relationship(
        back_populates="following",
        foreign_keys="Follower.following_id",
        cascade="all",
    )
    following: Mapped[List["Follower"]] = relationship(
        back_populates="follower",
        foreign_keys="Follower.follower_id",
        cascade="all",
    )

    def serialize(self, locale:str='en'):
        return {
            "id": self.id,
            "email": self.email,
            "display_name": self.display_name,
            "bio": self.bio,
            "location": self.location,
            "user_role": self.user_role.value,
            "created_at": _iso(self.created_at),
            "updated_at": _iso(self.updated_at),
            "created_at_human": _human(self.created_at, locale), 
            "updated_at_human": _human(self.updated_at, locale)

        }

story_tag = db.Table(
    "story_tag",
    db.metadata,
    db.Column("story_id", db.ForeignKey("story.id", ondelete="CASCADE"), primary_key=True),
    db.Column("tag_id", db.ForeignKey("tag.id", ondelete="CASCADE"), primary_key=True),
)

class Story(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    author_id: Mapped[int] = mapped_column(db.ForeignKey("user.id", ondelete="RESTRICT"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    synopsis: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[StoryStatus] = mapped_column(
        db.Enum(
            StoryStatus,
            name="story_status",
            native_enum=False,
            create_constraint=True,
            validate_strings=True,
        ),
        nullable=False,
        default=StoryStatus.DRAFT,
        server_default=StoryStatus.DRAFT.value,
    )
    published_at: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True))
    category_id: Mapped[Optional[int]] = mapped_column(db.ForeignKey("category.id", ondelete="SET NULL"))
    category: Mapped[Optional["Category"]] = relationship(back_populates="stories")
    author: Mapped["User"] = relationship(back_populates="stories")
    chapters: Mapped[List["Chapter"]] = relationship(back_populates="story", cascade="all", order_by="Chapter.number")
    views: Mapped[List["StoryView"]] = relationship(back_populates="story", cascade="all")
    comments: Mapped[List["Comment"]] = relationship(back_populates="story", foreign_keys="Comment.story_id")

    tags: Mapped[List["Tag"]] = relationship(secondary=story_tag, back_populates="stories")

    def serialize(self, locale:str='en'):
        return {
            "id": self.id,
            "author_id": self.author_id,
            "title": self.title,
            "synopsis": self.synopsis,
            "status": self.status.value,
            "published_at": _iso(self.published_at),
            "created_at": _iso(self.created_at),
            "updated_at": _iso(self.updated_at),
            "deleted_at": _iso(self.deleted_at),
            "created_at_human": _human(self.created_at, locale), 
            "updated_at_human": _human(self.updated_at, locale),
            "deleted_at_human": _human(self.deleted_at, locale),
            "category": self.category.serialize() if self.category else None,
            "tags": [t.serialize() for t in self.tags],
        }

class Chapter(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    story_id: Mapped[int] = mapped_column(db.ForeignKey("story.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(String(600), nullable=False)
    status: Mapped[ChapterStatus] = mapped_column(
        db.Enum(
            ChapterStatus,
            name="chapter_status",
            native_enum=False,
            create_constraint=True,
            validate_strings=True,
        ),
        nullable=False,
        default=ChapterStatus.DRAFT,
        server_default=ChapterStatus.DRAFT.value,
    )
    published_at: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True))

    story: Mapped[Story] = relationship(back_populates="chapters")
    comments: Mapped[List["Comment"]] = relationship(back_populates="chapter", cascade="all")

    def serialize(self, locale:str='en'):
        return {
            "id": self.id,
            "story_id": self.story_id,
            "title": self.title,
            "number": self.number,
            "content": self.content,
            "status": self.status.value,
            "published_at": _iso(self.published_at),
            "created_at": _iso(self.created_at),
            "updated_at": _iso(self.updated_at),
            "deleted_at": _iso(self.deleted_at),
            "created_at_human": _human(self.created_at, locale), 
            "updated_at_human": _human(self.updated_at, locale),
            "deleted_at_human": _human(self.deleted_at, locale),
        }

class StoryView(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    story_id: Mapped[int] = mapped_column(db.ForeignKey("story.id", ondelete="CASCADE"), nullable=False)
    view_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default="1")

    last_viewed_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    user: Mapped["User"] = relationship(back_populates="story_views")
    story: Mapped["Story"] = relationship(back_populates="views")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "story_id": self.story_id,
            "view_count": self.view_count,
        }

class Comment(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    story_id: Mapped[int] = mapped_column(db.ForeignKey("story.id", ondelete="CASCADE"), nullable=False)
    chapter_id: Mapped[Optional[int]] = mapped_column(db.ForeignKey("chapter.id", ondelete="CASCADE"),nullable=True)
    text: Mapped[str] = mapped_column(String(280), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(db.DateTime(timezone=True))

    user: Mapped["User"] = relationship(back_populates="comments")
    story: Mapped[Optional["Story"]] = relationship(back_populates="comments")
    chapter: Mapped[Optional["Chapter"]] = relationship(back_populates="comments")

    __table_args__ = (
        db.Index("ix_comment_story_chapter_created", "story_id", "chapter_id", "created_at"),
    )

    def serialize(self, locale:str='en'):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "story_id": self.story_id,
            "chapter_id": self.chapter_id,
            "text": self.text,
            "created_at": _iso(self.created_at),
            "updated_at": _iso(self.updated_at),
            "deleted_at": _iso(self.deleted_at),
            "created_at_human": _human(self.created_at, locale), 
            "updated_at_human": _human(self.updated_at, locale),
            "deleted_at_human": _human(self.deleted_at, locale),
        }

class Follower(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    follower_id: Mapped[int] = mapped_column(db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    following_id: Mapped[int] = mapped_column(db.ForeignKey("user.id", ondelete="CASCADE"), nullable=False)

    follower: Mapped["User"] = relationship(back_populates="following", foreign_keys=[follower_id])
    following: Mapped["User"] = relationship(back_populates="followers", foreign_keys=[following_id])

    def serialize(self):
        return {
            "id": self.id,
            "follower_id": self.follower_id,
            "following_id": self.following_id,
        }

class Category(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)

    stories: Mapped[List["Story"]] = relationship(back_populates="category")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
        }

class Tag(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)

    stories: Mapped[List["Story"]] = relationship(secondary=story_tag, back_populates="tags")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
        }