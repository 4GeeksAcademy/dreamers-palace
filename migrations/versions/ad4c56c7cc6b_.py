"""fix enums lowercase and add story_view.last_viewed_at

Revision ID: ad4c56c7cc6b
Revises: 649c137dbfb8
Create Date: 2025-08-31 20:50:05.663423
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'ad4c56c7cc6b'
down_revision = '649c137dbfb8'
branch_labels = None
depends_on = None


def upgrade():
    # 0) Normalizar datos de story/chapter a minúsculas
    op.execute(
        "UPDATE story   SET status = lower(trim(status)) WHERE status IS NOT NULL;")
    op.execute(
        "UPDATE chapter SET status = lower(trim(status)) WHERE status IS NOT NULL;")
    op.execute(
        "UPDATE story   SET status = 'draft' WHERE status IS NULL OR status NOT IN ('draft','published','deleted');")
    op.execute(
        "UPDATE chapter SET status = 'draft' WHERE status IS NULL OR status NOT IN ('draft','published','deleted');")

    # 1) Crear tabla story_view (si no existe)
    op.execute("DROP TABLE IF EXISTS story_view CASCADE;")
    op.create_table(
        'story_view',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('story_id', sa.Integer(), nullable=False),
        sa.Column('view_count', sa.Integer(),
                  server_default='1', nullable=False),
        sa.Column('last_viewed_at', sa.DateTime(timezone=True),
                  server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(
            ['story_id'], ['story.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # 2) Dropear constraints viejas
    op.execute("ALTER TABLE story   DROP CONSTRAINT IF EXISTS story_status;")
    op.execute("ALTER TABLE chapter DROP CONSTRAINT IF EXISTS chapter_status;")

    # 3) Volver a definir CHECK en minúsculas
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
    # Revertir cambios (si bajas)
    op.drop_table('story_view')

    op.execute("ALTER TABLE story   DROP CONSTRAINT IF EXISTS story_status;")
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
