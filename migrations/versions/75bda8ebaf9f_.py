"""ensure lowercase checks and story_view.last_viewed_at

Revision ID: 75bda8ebaf9f
Revises: ad4c56c7cc6b
Create Date: 2025-08-31 22:09:16.770796
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '75bda8ebaf9f'
down_revision = 'ad4c56c7cc6b'
branch_labels = None
depends_on = None


def upgrade():
    # 0) Normalizar datos por si quedó basura
    op.execute("UPDATE story   SET status = lower(trim(status)) WHERE status IS NOT NULL;")
    op.execute("UPDATE chapter SET status = lower(trim(status)) WHERE status IS NOT NULL;")
    op.execute("UPDATE story   SET status = 'draft' WHERE status IS NULL OR status NOT IN ('draft','published','deleted');")
    op.execute("UPDATE chapter SET status = 'draft' WHERE status IS NULL OR status NOT IN ('draft','published','deleted');")

    # 1) Asegurar columna last_viewed_at (NO la borres)
    op.execute("""
        ALTER TABLE story_view
        ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT now();
    """)

    # 2) Re-crear CHECKs en minúsculas de forma segura (evita duplicados)
    # STORY
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

    # CHAPTER
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
    # Downgrade simétrico (opcional)
    # Quita checks en minúsculas y vuelve a MAYÚSCULAS si hiciera falta
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

    # No borro last_viewed_at en downgrade (déjalo si lo necesitas)