"""add ordinal_position col to db_fields table

Revision ID: 72a809da5a77
Revises: ba8e412bfacf
Create Date: 2025-11-14 17:11:42.975601

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '72a809da5a77'
down_revision: Union[str, None] = 'ba8e412bfacf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'db_fields' in inspector.get_table_names():
        op.add_column('db_fields', sa.Column('ordinal_position', sa.Integer(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'db_fields' in inspector.get_table_names():
        op.drop_column('db_fields', 'ordinal_position')