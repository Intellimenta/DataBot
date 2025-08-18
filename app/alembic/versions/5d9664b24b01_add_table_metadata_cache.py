"""add metadata_cache for tables

Revision ID: 5d9664b24b01
Revises: 203940ff575c
Create Date: 2025-08-05 13:18:42.224340

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = '5d9664b24b01'
down_revision: Union[str, None] = '203940ff575c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'db_tables' in inspector.get_table_names() and 'bi_table_permissions_and_metadata' in inspector.get_table_names():
        op.add_column('db_tables', sa.Column('metadata_cache', sa.String(), nullable=True))
        op.add_column('db_tables', sa.Column('metadata_cache_is_up_to_date', sa.Boolean(), default=False))
        op.add_column('bi_table_permissions_and_metadata', sa.Column('metadata_cache', sa.String(), nullable=True))
        op.add_column('bi_table_permissions_and_metadata', sa.Column('metadata_cache_is_up_to_date', sa.Boolean(), default=False))


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = inspect(bind)
    if 'db_tables' in inspector.get_table_names() and 'bi_table_permissions_and_metadata' in inspector.get_table_names():
        op.drop_column('db_tables', 'metadata_cache')
        op.drop_column('db_tables', 'metadata_cache_is_up_to_date')
        op.drop_column('bi_table_permissions_and_metadata', 'metadata_cache')
        op.drop_column('bi_table_permissions_and_metadata', 'metadata_cache_is_up_to_date')

