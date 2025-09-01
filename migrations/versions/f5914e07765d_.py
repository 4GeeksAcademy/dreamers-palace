"""ensure lowercase checks on story/chapter (idempotent)

Revision ID: f5914e07765d
Revises: 75bda8ebaf9f
Create Date: 2025-08-31 22:25:41.347407
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'f5914e07765d'
down_revision = '75bda8ebaf9f'
branch_labels = None
depends_on = None


def upgrade():
    # 0) Normalizar datos a minúsculas y corregir valores inválidos
    op.execute("UPDATE story   SET status = lower(trim(status)) WHERE status IS NOT NULL;")
    op.execute("UPDATE chapter SET status = lower(trim(status)) WHERE status IS NOT NULL;")
    op.execute("UPDATE story   SET status = 'draft' WHERE status IS NULL OR status NOT IN ('draft','published','deleted');")
    op.execute("UPDATE chapter SET status = 'draft' WHERE status IS NULL OR status NOT IN ('draft','published','deleted');")

    # 1) STORY: eliminar constraint si existe y recrear en minúsculas
    op.execute("ALTER TABLE story DROP CONSTRAINT IF EXISTS story_status;")
    with op.batch_alter_table('story') as batch:
        batch.alter_column(
            'status',
            type_=sa.VARCHAR(length=20),
            existing_type=sa.VARCHAR(length=20),
            existing_nullable=False,
            server_default=sa.text("'draft'")
        )
        batch.create_check_constraint(
            'story_status',
            "status IN ('draft','published','deleted')"
        )

    # 2) CHAPTER: eliminar constraint si existe y recrear en minúsculas
    op.execute("ALTER TABLE chapter DROP CONSTRAINT IF EXISTS chapter_status;")
    with op.batch_alter_table('chapter') as batch:
        batch.alter_column(
            'status',
            type_=sa.VARCHAR(length=20),
            existing_type=sa.VARCHAR(length=20),
            existing_nullable=False,
            server_default=sa.text("'draft'")
        )
        batch.create_check_constraint(
            'chapter_status',
            "status IN ('draft','published','deleted')"
        )


def downgrade():
    # Revertir a MAYÚSCULAS (si realmente necesitas downgrade simétrico)
    op.execute("ALTER TABLE story DROP CONSTRAINT IF EXISTS story_status;")
    op.execute("ALTER TABLE chapter DROP CONSTRAINT IF EXISTS chapter_status;")

    with op.batch_alter_table('story') as batch:
        batch.alter_column(
            'status',
            type_=sa.VARCHAR(length=20),
            existing_type=sa.VARCHAR(length=20),
            existing_nullable=False,
            server_default=sa.text("'DRAFT'")
        )
        batch.create_check_constraint(
            'story_status',
            "status IN ('DRAFT','PUBLISHED','DELETED')"
        )

    with op.batch_alter_table('chapter') as batch:
        batch.alter_column(
            'status',
            type_=sa.VARCHAR(length=20),
            existing_type=sa.VARCHAR(length=20),
            existing_nullable=False,
            server_default=sa.text("'DRAFT'")
        )
        batch.create_check_constraint(
            'chapter_status',
            "status IN ('DRAFT','PUBLISHED','DELETED')"
        )