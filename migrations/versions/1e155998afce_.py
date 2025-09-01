"""normalize story/chapter status to UPPERCASE and enforce uppercase checks

Revision ID: 1e155998afce
Revises: f5914e07765d
Create Date: 2025-08-31 22:40:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '1e155998afce'
down_revision = 'f5914e07765d'
branch_labels = None
depends_on = None


def upgrade():
    # 0) Normalizar datos existentes a MAYÚSCULAS (y limpiar espacios)
    op.execute("UPDATE story   SET status = upper(trim(status)) WHERE status IS NOT NULL;")
    op.execute("UPDATE chapter SET status = upper(trim(status)) WHERE status IS NOT NULL;")
    op.execute("""
        UPDATE story
        SET status = 'DRAFT'
        WHERE status IS NULL OR status NOT IN ('DRAFT','PUBLISHED','DELETED');
    """)
    op.execute("""
        UPDATE chapter
        SET status = 'DRAFT'
        WHERE status IS NULL OR status NOT IN ('DRAFT','PUBLISHED','DELETED');
    """)

    # 1) Asegurar que las columnas sigan siendo VARCHAR(20) con default 'DRAFT'
    #    (evitamos usar type_=sa.Enum(...) para no reintroducir MAYÚSCULAS vía autogenerado)
    with op.batch_alter_table('story') as batch:
        batch.alter_column(
            'status',
            type_=sa.VARCHAR(length=20),
            existing_type=sa.VARCHAR(length=20),
            existing_nullable=False,
            server_default=sa.text("'DRAFT'")
        )

    with op.batch_alter_table('chapter') as batch:
        batch.alter_column(
            'status',
            type_=sa.VARCHAR(length=20),
            existing_type=sa.VARCHAR(length=20),
            existing_nullable=False,
            server_default=sa.text("'DRAFT'")
        )

    # 2) Dropear constraints previas (si existían en minúsculas o con otro nombre)
    op.execute("ALTER TABLE story   DROP CONSTRAINT IF EXISTS story_status;")
    op.execute("ALTER TABLE chapter DROP CONSTRAINT IF EXISTS chapter_status;")

    # 3) Crear CHECKs en MAYÚSCULAS (idempotente, tras el DROP IF EXISTS)
    with op.batch_alter_table('story') as batch:
        batch.create_check_constraint(
            'story_status',
            "status IN ('DRAFT','PUBLISHED','DELETED')"
        )

    with op.batch_alter_table('chapter') as batch:
        batch.create_check_constraint(
            'chapter_status',
            "status IN ('DRAFT','PUBLISHED','DELETED')"
        )


def downgrade():
    # Revertir a minúsculas si bajas (simétrico)
    op.execute("UPDATE story   SET status = lower(trim(status)) WHERE status IS NOT NULL;")
    op.execute("UPDATE chapter SET status = lower(trim(status)) WHERE status IS NOT NULL;")
    op.execute("""
        UPDATE story
        SET status = 'draft'
        WHERE status IS NULL OR status NOT IN ('draft','published','deleted');
    """)
    op.execute("""
        UPDATE chapter
        SET status = 'draft'
        WHERE status IS NULL OR status NOT IN ('draft','published','deleted');
    """)

    with op.batch_alter_table('story') as batch:
        batch.alter_column(
            'status',
            type_=sa.VARCHAR(length=20),
            existing_type=sa.VARCHAR(length=20),
            existing_nullable=False,
            server_default=sa.text("'draft'")
        )
    with op.batch_alter_table('chapter') as batch:
        batch.alter_column(
            'status',
            type_=sa.VARCHAR(length=20),
            existing_type=sa.VARCHAR(length=20),
            existing_nullable=False,
            server_default=sa.text("'draft'")
        )

    op.execute("ALTER TABLE story   DROP CONSTRAINT IF EXISTS story_status;")
    op.execute("ALTER TABLE chapter DROP CONSTRAINT IF EXISTS chapter_status;")

    with op.batch_alter_table('story') as batch:
        batch.create_check_constraint(
            'story_status',
            "status IN ('draft','published','deleted')"
        )
    with op.batch_alter_table('chapter') as batch:
        batch.create_check_constraint(
            'chapter_status',
            "status IN ('draft','published','deleted')"
        )