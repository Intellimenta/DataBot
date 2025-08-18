"""handle custom attribute assignments in the users table

Revision ID: f3139783fdf0
Revises: 104fd36263d8
Create Date: 2025-06-29 17:22:28.002921

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = 'f3139783fdf0'
down_revision: Union[str, None] = '104fd36263d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'users' in inspector.get_table_names():
        op.add_column('users', sa.Column('custom_attribute_assignments', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'users' in inspector.get_table_names():
        op.drop_column('users', 'custom_attribute_assignments')
