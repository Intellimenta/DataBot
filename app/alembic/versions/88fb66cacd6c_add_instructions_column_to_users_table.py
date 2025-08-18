"""add instructions column to users table

Revision ID: 88fb66cacd6c
Revises: d52b413f3830
Create Date: 2025-06-06 13:43:05.014134

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = '88fb66cacd6c'
down_revision: Union[str, None] = 'd52b413f3830'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'users' in inspector.get_table_names():
        op.add_column('users', sa.Column('instructions', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'users' in inspector.get_table_names():
        op.drop_column('users', 'instructions')
